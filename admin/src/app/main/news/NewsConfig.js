import settingsConfig from 'app/configs/settingsConfig';
import Create from './Create';
import Report from './Report';

const NewsConfig = {
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
            path: 'app/news/:moduleId',
            element: <Create />,
            auth: settingsConfig.defaultAuth
        },
        {
            path: 'app/news/:moduleId/report',
            element: <Report />,
            auth: settingsConfig.defaultAuth
        }
    ],
};

export default NewsConfig;
