import { React, lazy } from 'react';
import settingsConfig from 'app/configs/settingsConfig';
import Configuration from './Configuration';
import TicketDetails from './TicketDetails';

const ConfigurationConfig = {
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
      path: 'app/tickets',
      element: <Configuration />,
      auth: settingsConfig.defaultAuth
    },
    {
      path: 'app/tickets/:ticketId',
      element: <TicketDetails />,
      auth: settingsConfig.defaultAuth
    },
  ],
};

export default ConfigurationConfig;
