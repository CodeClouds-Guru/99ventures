import settingsConfig from 'app/configs/settingsConfig';
import CreateUpdateForm from './create-update/CreateUpdateForm';
import EmailTemplateContent from './EmailTemplateContent';

const EmailTemplateConfig = {
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
            path: 'app/email-templates',
            element: <EmailTemplateContent />,
            auth: settingsConfig.defaultAuth
        },
        {
            path: 'app/email-templates/:id',
            element: <CreateUpdateForm />,
            auth: settingsConfig.defaultAuth
        },
    ],
};

export default EmailTemplateConfig;
