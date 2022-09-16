// import CompanySite from './CompanySite';
import { React, lazy } from 'react';
import settingsConfig from 'app/configs/settingsConfig';

const CompanySite = lazy(() => import('./CompanySite'));

const CompanySiteConfig = {
    settings: {
        layout: {
            config: {
                navbar: {
                  display: false,
                },
                toolbar: {
                  display: false,
                },
                footer: {
                  display: true,
                },
                leftSidePanel: {
                  display: false,
                },
                rightSidePanel: {
                  display: false,
                },
              },
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
