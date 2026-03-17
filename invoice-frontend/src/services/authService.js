import api from './api';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const authService = {
  async register(userData) {
    // Make sure the data structure matches what backend expects
    const requestData = {
      name: userData.name,
      email: userData.email,
      password: userData.password
    };
    
    const response = await api.post('/auth/register', requestData);
    if (response.data && response.data.data) {
      const { token, id, name, email } = response.data.data;
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify({ id, name, email }));
      }
    }
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data && response.data.data) {
      const { token, id, name, email } = response.data.data;
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify({ id, name, email }));
      }
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser() {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};

export default authService;