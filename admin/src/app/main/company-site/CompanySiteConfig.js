// import CompanySite from './CompanySite';
import { React, lazy } from 'react';
import settingsConfig from 'app/configs/settingsConfig';

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
            auth: settingsConfig.defaultAuth
        },
    ],
};

export default CompanySiteConfig;
