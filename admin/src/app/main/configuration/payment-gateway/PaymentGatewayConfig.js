import { React, lazy } from 'react';
import settingsConfig from 'app/configs/settingsConfig';
import CreateEdit from './CreateEdit';

const PaymentGatewayConfig = {
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
      path: 'app/paymentconfigurations/:moduleId',
      element: <CreateEdit />,
      auth: settingsConfig.defaultAuth
    },
  ],
};


export default PaymentGatewayConfig;
