import settingsConfig from 'app/configs/settingsConfig';
import Index from './Index';

const FilemanagerConfig = {
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
            path: 'app/filemanager/*',
            element: <Index />,
            auth: settingsConfig.defaultAuth
        },
        {
            path: 'app/filemanager',
            element: <Index />,
            auth: settingsConfig.defaultAuth
        },
    ],
};

export default FilemanagerConfig;
