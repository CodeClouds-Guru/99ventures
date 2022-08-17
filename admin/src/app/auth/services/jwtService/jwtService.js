import FuseUtils from '@fuse/utils/FuseUtils';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { reject } from 'lodash';
import jwtServiceConfig from './jwtServiceConfig';
// import settingsConfig from 'app/configs/settingsConfig';

/* eslint-disable camelcase */

class JwtService extends FuseUtils.EventEmitter {
  init() {
    this.setInterceptors();
    this.handleAuthentication();
  }

  setInterceptors = () => {
    axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (err) => {
        return new Promise((resolve, reject) => {
          if (err.response.status === 401 && err.config && !err.config.__isRetryRequest) {
            // if you ever get an unauthorized response, logout the user
            this.emit('onAutoLogout', null);
            this.setSession(null);
          }
          if (err.response.status === 401) {
            let msg = err.response.data ? err.response.data.errors : err.message;
            this.emit('onForbidden', msg);
          }
          throw err;
        });
      }
    );
  };

  handleAuthentication = () => {
    const access_token = this.getAccessToken();

    if (!access_token) {
      this.emit('onNoAccessToken');

      return;
    }

    if (this.isAuthTokenValid(access_token)) {
      this.setSession(access_token);
      this.emit('onAutoLogin', true);
    } else {
      this.setSession(null);
      this.emit('onAutoLogout', null);
    }
  };

  createUser = (data) => {
    return new Promise((resolve, reject) => {
      axios.post(jwtServiceConfig.signUp, data).then((response) => {
        if (response.data.user) {
          this.setSession(response.data.access_token);
          resolve(response.data.user);
          this.emit('onLogin', response.data.user);
        } else {
          reject(response.data.error);
        }
      });
    });
  };

  loginDataSet = (response) => {
    response.data.user.role = 'roles' in response.data.user ? response.data.user.roles.map((item) => { return item.slug }) : ['admin', 'staff'];
    response.data.user.permissions = 'permissions' in response.data.user ? response.data.user.permissions : [];
    response.data.user.shortcuts = 'shortcuts' in response.data.user ? response.data.user.shortcuts : [];
    // response.data.user.companies = ('companies' in response.data || 'companies' in response.data.user) ? response.data.companies : [];
    if ('companies' in response.data) {
      response.data.user.companies = response.data.companies;
    } else if ('companies' in response.data.user) {
      response.data.user.companies = response.data.user.companies;
    } else {
      response.data.user.companies = [];
    }
  }

  signInWithEmailAndPassword = (email, password) => {
    return new Promise((resolve, reject) => {
      axios
        .post(jwtServiceConfig.signIn, {
          email,
          password,
        })
        .then((response) => {
          if (response.data.user) {
            this.loginDataSet(response);
            this.setSession(response.data.access_token);
            resolve(response.data.user);
            this.emit('onLogin', response.data.user);
          } else {
            reject(response.data.error);
          }
        }).catch((error) => {
          reject(error);
        });
    });
  };

  signInWithToken = () => {
    return new Promise((resolve, reject) => {
      axios
        .get(jwtServiceConfig.accessToken)
        .then((response) => {
          const companySiteId = this.getCompanySiteId();
          if (response.data.user) {
            this.loginDataSet(response);
            this.setSession(response.data.access_token);
            resolve(response.data.user);
            if (companySiteId.company_id && companySiteId.site_id) {
              this.setCompanySiteId(companySiteId.company_id, companySiteId.site_id)
              this.getProfile();
            } else {
              this.emit('onLogin', response.data.user);
            }
          } else {
            this.logout();
            reject(new Error(null));
          }
        })
        .catch((error) => {
          this.logout();
          // reject(new Error('Failed to login with token.'));
          reject(new Error(null));
        });
    });
  };

  getProfile = () => {
    return new Promise((resolve, reject) => {
      axios
        .get(jwtServiceConfig.profile)
        .then((response) => {
          // console.log('response', response);
          if (response.data.user) {
            this.loginDataSet(response);
            resolve(response.data.user);
            this.emit('onLogin', response.data.user);
          } else {
            this.logout();
          }
        })
        .catch((error) => {
          this.logout();
          reject(new Error(null));
        });
    });
  }

  updateUserData = (user) => {
    return axios.post(jwtServiceConfig.updateUser, {
      user,
    });
  };

  setSession = (access_token) => {
    if (access_token) {
      localStorage.setItem('jwt_access_token', access_token);
      axios.defaults.headers.common.Authorization = `Bearer ${access_token}`;
    } else {
      localStorage.removeItem('jwt_access_token');
      delete axios.defaults.headers.common.Authorization;
    }
  };

  setCompanySiteId = (companyId, siteId) => {
    if (companyId) {
      localStorage.setItem('jwt_company_id', companyId);
      axios.defaults.headers.common.company_id = companyId;
    } else {
      localStorage.removeItem('jwt_company_id');
      delete axios.defaults.headers.common.company_id;
    }
    if (siteId) {
      localStorage.setItem('jwt_site_id', siteId);
      axios.defaults.headers.common.site_id = siteId;
    } else {
      localStorage.removeItem('jwt_site_id');
      delete axios.defaults.headers.common.site_id;
    }
  };

  getCompanySiteId = () => {
    return {
      company_id: localStorage.getItem('jwt_company_id'),
      site_id: localStorage.getItem('jwt_site_id')
    };
  }

  logout = () => {
    axios
      .post(jwtServiceConfig.logout);
    this.setSession(null);
    this.setCompanySiteId(null, null);
    this.emit('onLogout', 'Logged out');
  };

  isAuthTokenValid = (access_token) => {
    if (!access_token) {
      return false;
    }
    const decoded = jwtDecode(access_token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      console.warn('access token expired');
      return false;
    }

    return true;
  };

  getAccessToken = () => {
    return window.localStorage.getItem('jwt_access_token');
  };

  sentResetPasswordLink = (email) => {
    return axios.post(jwtServiceConfig.forgotPassword, {
      email,
    }).then((response) => {
      return response.data;
    }).catch((error) => {
      return error.response.data;
    });
  };

  resetPassword = ({ hash, password }) => {
    return axios.post(jwtServiceConfig.resetPassword, {
      hash,
      password,
    }).then((response) => {
      return response.data;
    }).catch((error) => {
      return error.response.data;
    });
  };
}

const instance = new JwtService();

export default instance;
