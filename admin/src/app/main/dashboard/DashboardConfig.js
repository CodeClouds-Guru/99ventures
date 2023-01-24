// import Dashboard from './Dashboard';
import { React, lazy } from 'react';

const Dashboard = lazy(() => import('./Dashboard'));

const DashboardConfig = {
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
            path: 'dashboard',
            element: <Dashboard />,
        },
    ],
};

export default DashboardConfig;
