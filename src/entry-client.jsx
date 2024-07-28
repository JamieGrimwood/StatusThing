import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { NextUIProvider } from '@nextui-org/react';

import { Router } from './router';

import './index.css';

ReactDOM.hydrateRoot(
    document.getElementById('app'),
    <BrowserRouter>
        <NextUIProvider>
            <Router />
        </NextUIProvider>
    </BrowserRouter>
)