import { React, lazy } from 'react';
import settingsConfig from 'app/configs/settingsConfig';
import Components from './Components';
import CreateUpdate from "./create-update/CreateUpdate";

const ComponentsConfig = {
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
      path: 'app/components',
      element: <Components />,
      auth: settingsConfig.defaultAuth
    },
    {
      path: 'app/components/create',
      element: <CreateUpdate />,
      auth: settingsConfig.defaultAuth
    },
    {
      path: 'app/components/:moduleId',
      element: <CreateUpdate />,
      auth: settingsConfig.defaultAuth
    },
  ],
};

export default ComponentsConfig;
