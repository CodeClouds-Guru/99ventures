import { React } from 'react';
import settingsConfig from 'app/configs/settingsConfig';
import Paypal from './Paypal';

const PaypalConfig = {
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
            path: 'app/paypal',
            element: <Paypal />,
            auth: settingsConfig.defaultAuth
        },
    ],
};

export default PaypalConfig;
