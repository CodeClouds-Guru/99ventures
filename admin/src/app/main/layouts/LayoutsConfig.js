import { React, lazy } from 'react';
import settingsConfig from 'app/configs/settingsConfig';
import Layouts from './Layouts';
import CreateEdit from './CreateEdit';

const LayoutsConfig = {
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
      path: 'app/layouts',
      element: <Layouts />,
      auth: settingsConfig.defaultAuth
    },
    {
      path: 'app/layouts/:moduleId',
      element: <CreateEdit />,
      auth: settingsConfig.defaultAuth
    },
  ],
};

export default LayoutsConfig;
