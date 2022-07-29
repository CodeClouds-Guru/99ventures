// import CompanySite from './CompanySite';
import { React, lazy } from 'react';

const CompanySite = lazy(() => import('./CompanySite'));

const CompanySiteConfig = {
    settings: {
        layout: {
            config: {},
        },
    },
    routes: [
        {
            path: 'company-site',
            element: <CompanySite />,
        },
    ],
};

export default CompanySiteConfig;
