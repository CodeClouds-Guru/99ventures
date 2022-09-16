import Profile from './Profile';
import settingsConfig from 'app/configs/settingsConfig';

const ProfileConfig = {
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
            path: 'profile',
            element: <Profile />,
            auth: settingsConfig.defaultAuth
        },
    ],
};

export default ProfileConfig;
