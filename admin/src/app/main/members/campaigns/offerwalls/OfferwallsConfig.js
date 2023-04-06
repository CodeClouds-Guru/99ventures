import { React, lazy } from 'react';
import settingsConfig from 'app/configs/settingsConfig';
import Index from './Index'
import OfferwallsCreateUpdate from './CreateUpdate';

const OfferwallsConfig = {
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
      path: 'app/offer-walls',
      element: <Index />,
      auth: settingsConfig.defaultAuth
    },
    {
      path: 'app/offer-walls/create',
      element: <OfferwallsCreateUpdate />,
      auth: settingsConfig.defaultAuth
    },
    {
      path: 'app/offer-walls/:moduleId',
      element: <OfferwallsCreateUpdate />,
      auth: settingsConfig.defaultAuth
    }
  ],
};

export default OfferwallsConfig;
