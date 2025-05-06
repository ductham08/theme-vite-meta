import React from 'react';
import ReactDOMServer from 'react-dom/server';
import routes from './routes/routes';
import { StaticRouter } from 'react-router-dom';

export function render(url) {
    return ReactDOMServer.renderToString(
        <React.StrictMode>
            <StaticRouter location={url}>
                <RouterProvider router={routes} />
            </StaticRouter>
        </React.StrictMode>
    );
} 