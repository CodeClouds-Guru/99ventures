const baseURL = 'http://localhost:4000/api/';
const jwtServiceConfig = {
  signIn: baseURL + 'login',
  signUp: baseURL + 'sign-up',
  accessToken: baseURL + 'refresh-token',
  updateUser: baseURL + 'user/update',
  forgotPassword: baseURL + 'forgot-password',
  setPassword: baseURL + 'set-password',
};

export default jwtServiceConfig;
