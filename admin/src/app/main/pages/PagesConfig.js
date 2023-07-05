import { React, lazy } from 'react';
import settingsConfig from 'app/configs/settingsConfig';
import Pages from './Pages';

const PagesConfig = {
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
      path: 'app/pages',
      element: <Pages />,
      auth: settingsConfig.defaultAuth
    },
  ],
};

export default PagesConfig;
