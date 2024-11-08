import settingsConfig from 'app/configs/settingsConfig';
import CreateUpdate from './CreateUpdate';
import MembershipList from './MembershipList';

const MembershipConfig = {
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
            path: 'app/membership-tiers/',
            element: <MembershipList />,
            auth: settingsConfig.defaultAuth
        },
        {
            path: 'app/membership-tiers/:moduleId',
            element: <CreateUpdate/>,
            auth: settingsConfig.defaultAuth
        }
    ],
};

export default MembershipConfig;
