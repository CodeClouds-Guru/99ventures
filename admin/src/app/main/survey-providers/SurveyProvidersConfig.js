import { React } from 'react';
import settingsConfig from 'app/configs/settingsConfig';
import Index from './Index'

const SurveyProvidersConfig = {
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
      path: 'app/survey-providers',
      element: <Index />,
      auth: settingsConfig.defaultAuth
    },
  ],
};

export default SurveyProvidersConfig;
