import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { NextUIProvider } from '@nextui-org/react';

import { Router } from './router';

export function render({ path }) {
    return ReactDOMServer.renderToString(
        <StaticRouter location={path}>
            <NextUIProvider>
                <Router />
            </NextUIProvider>
        </StaticRouter>
    )
}