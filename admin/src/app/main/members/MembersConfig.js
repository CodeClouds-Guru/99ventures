import settingsConfig from 'app/configs/settingsConfig';
import Downline from './Downline';
import Index from './Index';
import IPLogs from './IPlogs';
import MemberTransaction from './MemberTransaction';
import Withdraws from './Withdraws'
import MembersList from './listing/Listing';

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
            path: 'app/members',
            element: <MembersList />,
            auth: settingsConfig.defaultAuth
        },
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
        {
            path: 'app/members/:moduleId/downline',
            element: <Downline />,
            auth: settingsConfig.defaultAuth
        },
        {
            path: 'app/members/:moduleId/history',
            element: <MemberTransaction />,
            auth: settingsConfig.defaultAuth
        },
    ],
};

export default UserConfig;
