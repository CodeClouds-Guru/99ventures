import { React, lazy } from 'react';
import settingsConfig from 'app/configs/settingsConfig';
import Configurations from './Configurations';

const ConfigurationsConfig = {
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
      path: 'app/shoutbox-configurations',
      element: <Configurations />,
      auth: settingsConfig.defaultAuth
    },
  ],
};

export default ConfigurationsConfig;
