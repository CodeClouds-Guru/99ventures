import settingsConfig from 'app/configs/settingsConfig';
import Index from './Index';
import IPLogs from './IPlogs';
import Withdraws from './Withdraws'

const UserConfig = {
    settings: {
        layout: {
            config: {
                header: {
                    display: true,
                },
                navbar: {
                    display: true,
                },
                toolbar: {
                    display: true,
                },
                footer: {
                    display: true,
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
            path: 'app/members/:moduleId/',
            element: <Index />,
            auth: settingsConfig.defaultAuth
        },
        {
            path: 'app/members/:moduleId/iplogs',
            element: <IPLogs />,
            auth: settingsConfig.defaultAuth
        },
        {
            path: 'app/members/:moduleId/withdraws',
            element: <Withdraws />,
            auth: settingsConfig.defaultAuth
        },
    ],
};

export default UserConfig;
