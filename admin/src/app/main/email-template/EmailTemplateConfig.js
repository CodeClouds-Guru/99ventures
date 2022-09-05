import settingsConfig from 'app/configs/settingsConfig';
import EmailTemplate from './EmailTemplate';
import CreateUpdateForm from './create-update/CreateUpdateForm';
import { Link, useNavigate, useParams } from 'react-router-dom';

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
        {
            path: 'app/email-template/:id',
            element: <CreateUpdateForm />,
            auth: settingsConfig.defaultAuth
        },
    ],
};

export default EmailTemplateConfig;
