import { React, lazy } from 'react';
import settingsConfig from 'app/configs/settingsConfig';
import Shoutbox from './Shoutbox';

const ShoutboxConfig = {
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
      path: 'app/shoutbox',
      element: <Shoutbox />,
      auth: settingsConfig.defaultAuth
    },
  ],
};

export default ShoutboxConfig;
