const jwtServiceConfig = {
  signIn: 'login',
  signUp: 'signup',
  accessToken: 'refresh-token',
  updateUser: 'user/update',
  invitationDetails: 'invitation-details',
  forgotPassword: 'forgot-password',
  resetPassword: 'reset-password',
  logout: 'logout',
  companies: 'companies',
  profile: 'profile',
  getEmailConguration: 'emailconfigurations/view',
  saveEmailConguration: 'emailconfigurations/save',
  getIpConfiguration: 'ip-configurations',
  saveIpConfiguration: 'ip-configurations/save',
  getDowntimeConfiguration: 'ip-downtime-settings',
  saveDowntimeConfiguration: 'ip-downtime-update',
};

export default jwtServiceConfig;
