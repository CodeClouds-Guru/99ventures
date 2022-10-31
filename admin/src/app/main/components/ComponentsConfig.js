import { React, lazy } from 'react';
import settingsConfig from 'app/configs/settingsConfig';
import Components from './Components';

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
  ],
};

export default ComponentsConfig;
