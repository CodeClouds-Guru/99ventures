import settingsConfig from 'app/configs/settingsConfig';
import TicketingSystemPage from './TicketingSystemPage';

const TicketingSystemConfig = {
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
            path: 'ticketing-system',
            element: <TicketingSystemPage />,
            auth: settingsConfig.defaultAuth
        },
    ],
};

export default TicketingSystemConfig;
