import settingsConfig from 'app/configs/settingsConfig';
import CreateUpdate from './CreateUpdate';
import Autocomplete from './Autocomplete';
// import Report from './Report';

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
            path: 'app/promo-codes/create',
            element: <CreateUpdate />,
            auth: settingsConfig.defaultAuth
        },
        // {
        //     path: 'app/membership/:moduleId',
        //     element: <Create />,
        //     auth: settingsConfig.defaultAuth
        // }        
    ],
};

export default MembershipConfig;
