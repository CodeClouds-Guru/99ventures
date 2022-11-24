import settingsConfig from 'app/configs/settingsConfig';
import Index from './Index';
 
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
            path: 'app/users/:moduleId',
            element: <Index />,
            auth: settingsConfig.defaultAuth
        },
    ],
};

export default UserConfig;
