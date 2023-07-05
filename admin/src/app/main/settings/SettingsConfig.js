import settingsConfig from 'app/configs/settingsConfig';
import CreateUpdateForm from './Index';

const ScriptConfig = {
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
            path: 'app/settings',
            element: <CreateUpdateForm />,
            auth: settingsConfig.defaultAuth
        },
    ],
};

export default ScriptConfig;
