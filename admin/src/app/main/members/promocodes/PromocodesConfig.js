import settingsConfig from 'app/configs/settingsConfig';
import RedemptionReport from './RedemptionReport';

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
            path: 'app/promo-codes/:moduleId/redemption-report',
            element: <RedemptionReport />,
            auth: settingsConfig.defaultAuth
        }
    ],
};

export default PromocodesConfig;
