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
  getEmailConguration: 'emailconfigurations/view',
  saveEmailConguration: 'emailconfigurations/save',
  getIpConfiguration: 'ip-configurations',
  saveIpConfiguration: 'ip-configurations/save',
  getDowntimeConfiguration: 'ip-downtime-settings',
  saveDowntimeConfiguration: 'ip-downtime-update',
  profile: 'profile',
  updateProfile: 'profile-update',
};

export default jwtServiceConfig;
