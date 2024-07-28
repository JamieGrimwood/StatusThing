import React from 'react';
import { Spinner, Accordion, AccordionItem, Tooltip, Divider } from '@nextui-org/react';

export default function Home() {
    const [categories, setCategories] = React.useState();

    React.useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/status`)
            .then(response => response.json())
            .then(json => setCategories(json));

        const id = setInterval(() => {
            fetch(`${import.meta.env.VITE_BACKEND_URL}/status`)
                .then(response => response.json())
                .then(json => setCategories(json));
        }, 60000);

        return () => clearInterval(id);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold">Falcon Hosting Status</h1>
            <div className="banner-container">
                <div className={`banner ${!categories ? 'banner--active' : ''}`}>
                    <div className="bg-gray-100 rounded-lg p-4 mx-4 my-8 text-center max-w-[784px] h-[88px] w-full animate-pulse" />
                </div>
                <div className={`banner ${categories ? 'banner--active' : ''}`}>
                    <div className="bg-green-200 rounded-lg p-4 mx-4 my-8 text-center max-w-[784px] w-full">
                        <h1 className="text-lg font-bold text-green-800">All Systems Operational</h1>
                        <p className="text-sm text-green-700 mt-2">Everything is running smoothly. No issues to report.</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-4 max-w-[800px] w-full">
                {categories ?
                    <Accordion variant="splitted">
                        {Object.keys(categories).map((category, index) =>
                            <AccordionItem
                                key={index}
                                aria-label={Object.keys(categories)[index]}
                                title={
                                    <div className="flex justify-between w-full">
                                        <span>{Object.keys(categories)[index]}</span>
                                        <div className="flex flex-row items-center justify-center gap-3">
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600"></span>
                                            </span>
                                            <span className="text-green-600" style={{ userSelect: 'none' }}>Operational</span>
                                        </div>
                                    </div>
                                }>
                                <div className="flex flex-col gap-2">
                                    {categories[Object.keys(categories)[index]].map((monitor, index) =>
                                        <>
                                            <Divider key={index} />
                                            <div key={index} className="flex flex-row items-center justify-between">
                                                <div className="flex flex-row items-center gap-4 text-start">
                                                    <span>{monitor.monitor_name}</span>
                                                    <span className="text-sm text-gray-500">{monitor.status === 'online' ? 'Operational' : 'Offline'}</span>
                                                </div>
                                                <span className="text-sm text-gray-500">{monitor.ping}ms</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </AccordionItem>
                        )}
                    </Accordion>
                    :
                    <div className="flex justify-center">
                        <Spinner />
                    </div>
                }
            </div>
        </div>
    )
}