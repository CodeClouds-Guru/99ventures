import EmailTemplate from './EmailTemplate';
import settingsConfig from 'app/configs/settingsConfig';

const EmailTemplateConfig = {
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
            path: 'app/email-template',
            element: <EmailTemplate />,
            auth: settingsConfig.defaultAuth
        },
    ],
};

export default EmailTemplateConfig;
