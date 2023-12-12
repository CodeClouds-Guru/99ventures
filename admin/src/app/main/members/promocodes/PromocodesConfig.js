import { React, lazy } from 'react';
import settingsConfig from 'app/configs/settingsConfig';
import List from '../../crud/list/List';
import CreateEdit from '../../crud/create-edit/CreateEdit';

const PromocodesConfig = {
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
      path: 'app/promocodes',
      element: <List />,
      auth: settingsConfig.defaultAuth
    },
    {
      path: 'app/promocodes/create',
      element: <CreateEdit />,
      auth: settingsConfig.defaultAuth
    },
    {
      path: 'app/promocodes/:moduleId',
      element: <CreateEdit />,
      auth: settingsConfig.defaultAuth
    }
  ],
};

export default PromocodesConfig;
