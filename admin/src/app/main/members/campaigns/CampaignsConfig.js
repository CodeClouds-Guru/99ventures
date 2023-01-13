import { React, lazy } from 'react';
import settingsConfig from 'app/configs/settingsConfig';
import Campaigns from './Campaigns';
import CampaignsCreateUpdate from './create-update/CreateUpdate';
import Report from './Report';
import OfferwallsCreateUpdate from './offerwalls/CreateUpdate';
import Offerwalls from './offerwalls/Index';

const CampaignsConfig = {
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
      path: 'app/campaigns',
      element: <Campaigns />,
      auth: settingsConfig.defaultAuth
    },
    {
      path: 'app/campaigns/create',
      element: <CampaignsCreateUpdate />,
      auth: settingsConfig.defaultAuth
    },
    {
      path: 'app/campaigns/:moduleId',
      element: <CampaignsCreateUpdate />,
      auth: settingsConfig.defaultAuth
    },
    {
      path: 'app/campaigns/:campaignId/report',
      element: <Report />,
      auth: settingsConfig.defaultAuth
    },
    {
      path: 'app/campaigns/:moduleId/offerwalls',
      element: <Offerwalls />,
      auth: settingsConfig.defaultAuth
    },
    {
      path: 'app/campaigns/:campaignId/offerwalls/create',
      element: <OfferwallsCreateUpdate />,
      auth: settingsConfig.defaultAuth
    },
    {
      path: 'app/campaigns/:campaignId/offerwalls/:moduleId',
      element: <OfferwallsCreateUpdate />,
      auth: settingsConfig.defaultAuth
    }
  ],
};

export default CampaignsConfig;
