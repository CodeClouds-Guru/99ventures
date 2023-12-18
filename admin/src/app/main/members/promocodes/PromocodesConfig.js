import settingsConfig from 'app/configs/settingsConfig';
import Redeemed from './Redeemed';

const PromocodesConfig = {
    settings: {
        layout: {
            config: {
                header: {
                    display: true,
                },
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
            path: 'app/promo-codes/:moduleId/redeemed',
            element: <Redeemed />,
            auth: settingsConfig.defaultAuth
        }
    ],
};

export default PromocodesConfig;
