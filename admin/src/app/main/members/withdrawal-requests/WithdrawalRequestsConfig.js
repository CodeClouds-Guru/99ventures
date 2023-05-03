import { React } from 'react';
import settingsConfig from 'app/configs/settingsConfig';
import Index from './Index';

const WithdrawalRequestsConfig = {
    settings: {
        layout: {
            config: {
                navbar: {
                    display: true,
                },
                toolbar: {
                    display: true,
                },
                footer: {
                    display: false,
                },
                leftSidePanel: {
                    display: true,
                },
                rightSidePanel: {
                    display: false,
                },
            },
        },
    },
    routes: [
        {
            path: 'app/withdrawal-requests',
            element: <Index />,
            auth: settingsConfig.defaultAuth
        },
    ],
};

export default WithdrawalRequestsConfig;
