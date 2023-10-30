import settingsConfig from 'app/configs/settingsConfig';
import Index from './Index';
import MembersContent from './MembersContent';
import CreateMember from './CreateMember';
import Pages from './Pages';

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
            path: 'app/members',
            element: <MembersContent />,
            auth: settingsConfig.defaultAuth
        },
        {
            path: 'app/members/create',
            element: <CreateMember />,
            auth: settingsConfig.defaultAuth
        },
        {
            path: 'app/members/:moduleId/',
            element: <Index />,
            auth: settingsConfig.defaultAuth
        },
        {
            path: 'app/members/:moduleId/:module',
            element: <Pages />,
            auth: settingsConfig.defaultAuth
        }
    ],
};

export default UserConfig;
