import settingsConfig from 'app/configs/settingsConfig';
import CreateEdit from './CreateEdit';

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
            path: 'app/news/create',
            element: <CreateEdit />,
            auth: settingsConfig.defaultAuth
        }
    ],
};

export default NewsConfig;
