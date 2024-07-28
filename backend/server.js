import HyperExpress from 'hyper-express';
import fs from 'fs';
import yaml from 'js-yaml';
import fetch from 'node-fetch';
import ping from 'ping';
import net from 'net';
import cron from 'node-cron';
import cors from 'cors';
import http from 'node:http';
import https from 'node:https';

import { connection, createTables } from './lib/database.js';
createTables();

const app = new HyperExpress.Server();
const PORT = 3001;

app.use(cors({ origin: 'http://dev.jmgcoding.com:3000' }));

app.options('*', (request, response) => {
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.send();
});

const setMonitorIsOnline = async (monitor_id, monitor_name, category, ping) => {
    console.log(monitor_id, monitor_name, category, ping)
    const query = `UPDATE monitor_status SET status = 'online', last_checked = NOW(), ping = ? WHERE monitor_id = ?`;
    try {
        console.log(ping, monitor_id)
        const [results] = await connection.execute(query, [ping, monitor_id]);
        console.log(results)
        if (results.affectedRows === 0) {
            const insertQuery = `INSERT INTO monitor_status (monitor_id, monitor_name, category, ping, status, last_checked) VALUES (?, ?, ?, ?, 'online', ?, NOW())`;
            await connection.execute(insertQuery, [monitor_id, monitor_name, category, ping]);
            console.log('Inserted new status record for monitor', monitor_id);
        }
    } catch (err) {
        console.error('Error updating status:', err.stack);
    }
}

const removeNonExistingMonitors = async (existingMonitorIds) => {
    try {
        const [rows] = await connection.query('SELECT monitor_id FROM monitor_status');
        const monitorIdsInDb = rows.map(row => row.monitor_id);
        const monitorsToRemove = monitorIdsInDb.filter(id => !existingMonitorIds.includes(id));

        for (const id of monitorsToRemove) {
            await connection.execute('DELETE FROM monitor_status WHERE monitor_id = ?', [id]);
        }
    } catch (err) {
        console.error('Error removing non-existing monitors:', err);
    }
};

const check = async () => {
    const categories = yaml.load(fs.readFileSync('monitors.yaml', 'utf8')).categories;
    const existingMonitorIds = [];

    categories.forEach(category => {
        const categoryName = Object.keys(category)[0];
        category[categoryName].forEach(monitor => {
            existingMonitorIds.push(monitor.monitor_id);
            if (monitor.type === "http") {
                http.get(monitor.url, function (res) {
                    setMonitorIsOnline(monitor.id, monitor.name, categoryName, 0)
                })
                    .on("error", function (e) {
                        console.log(e)
                    });
            } else if (monitor.type === "https") {
                https.get(monitor.url, function (res) {
                    setMonitorIsOnline(monitor.id, monitor.name, categoryName, 0)
                })
                    .on("error", function (e) {
                        console.log(e)
                    });
            } else if (monitor.type === "icmp") {
                ping.promise.probe(monitor.hostname)
                    .then(function (res) {
                        setMonitorIsOnline(monitor.id, monitor.name, categoryName, res.time)
                        console.log(res.alive, res.time);
                    });
            }
        });
    });
    await removeNonExistingMonitors(existingMonitorIds);
}
check();

// Schedule monitor checks every minute
cron.schedule('* * * * *', () => {
    console.log('Running monitor check');
    check();
});

function groupMonitorsByCategory(monitors) {
    return monitors.reduce((grouped, monitor) => {
        const category = monitor.category;
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push(monitor);
        return grouped;
    }, {});
}

app.get('/status', async (req, res) => {
    const query = `SELECT * FROM monitor_status`;
    try {
        const [results] = await connection.query(query);
        res.json(groupMonitorsByCategory(results));
    } catch (err) {
        res.json({ error: 'Error fetching status' });
    }
});

// Start the server
app.listen(PORT)
    .then(() => console.log(`Server running on port ${PORT}`))
    .catch(error => console.error('Failed to start server:', error));
