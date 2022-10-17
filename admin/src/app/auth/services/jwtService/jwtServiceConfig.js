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
  getGeneralConfiguration: 'general-configurations',
  saveGeneralConfiguration: 'general-configurations/save',
  getEmailConguration: 'email-configurations/view',
  saveEmailConguration: 'email-configurations/save',
  getIpConfiguration: 'ip-configurations',
  saveIpConfiguration: 'ip-configurations/save',
  getDowntimeConfiguration: 'downtime/list',
  saveDowntimeConfiguration: 'downtime/update',
  profile: 'profile',
  updateProfile: 'profile-update',
  saveEmailTemplates: 'email-templates/save',
  updateEmailTemplates: 'email-templates/update',
  getSingleEmailTemplate: 'email-templates/edit',
  getEmailTemplatesFieldData: 'email-templates/add',
  confirmAccountCheck: 'check-auth',
  getMetaTagsConfiguration: 'meta-tag-configurations',
  saveMetaTagsConfiguration: 'meta-tag-configurations/update',
  getPaymentMethodConfiguration: 'payment-configurations',
  savePaymentMethodConfiguration: 'payment-configurations/update',
  saveScriptsData: 'scripts/save',
  updateScriptsData: 'scripts/update',
  getSingleScriptData: 'scripts/edit',
  roleEdit: 'roles/edit',
  roleUpdate: 'roles/update',
  getSingleTickketDetails: 'tickets/view',
  filemanagerUploadFile: 'file-manager/save'
};

export default jwtServiceConfig;
