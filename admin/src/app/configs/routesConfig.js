import FuseUtils from '@fuse/utils';
import FuseLoading from '@fuse/core/FuseLoading';
import { Navigate } from 'react-router-dom';
import jwtService from '../auth/services/jwtService';
import settingsConfig from 'app/configs/settingsConfig';
import SignInConfig from '../main/sign-in/SignInConfig';
import ForgotPasswordConfig from '../main/forgot-password/ForgotPasswordConfig';
import ResetPasswordConfig from '../main/reset-password/ResetPasswordConfig';
import SignOutConfig from '../main/sign-out/SignOutConfig';
import Error404Page from '../main/404/Error404Page';
import DashboardConfig from '../main/dashboard/DashboardConfig';
import CRUDConfig from '../main/crud/CRUDConfig';
import CompanySiteConfig from '../main/company-site/CompanySiteConfig';
const routeConfigs = [DashboardConfig, SignOutConfig, SignInConfig, ForgotPasswordConfig, ResetPasswordConfig, CompanySiteConfig, CRUDConfig];

/*
* This is to redirect to company-site selection screen if company and site ID is not set
*/
const companySiteId = jwtService.getCompanySiteId();
if ((!companySiteId.company_id && !companySiteId.site_id && window.location.pathname !== '/company-site')) {
  window.location.href = '/company-site';
}

/*
* This is main route configs for the app
*/
const routes = [
  ...FuseUtils.generateRoutesFromConfigs(routeConfigs, settingsConfig.defaultAuth),
  {
    path: '/',
    element: <Navigate to="/dashboard" />,
    auth: settingsConfig.defaultAuth,
  },
  // {
  //   path: '/company-site',
  //   element: <Navigate to="/company-site" />,
  //   auth: settingsConfig.defaultAuth,
  // },
  {
    path: 'loading',
    element: <FuseLoading />,
  },
  {
    path: '404',
    element: <Error404Page />,
  },
  {
    path: '*',
    element: <Navigate to="404" />,
  },
];

export default routes;
