import { React, lazy } from 'react';
import settingsConfig from 'app/configs/settingsConfig';
import Index from './Index'

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
      path: 'app/offerwalls',
      element: <Index />,
      auth: settingsConfig.defaultAuth
    },
   
  ],
};

export default OfferwallsConfig;
