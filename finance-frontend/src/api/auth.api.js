import { api } from './fetch.js';

export const authAPI = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res?.data;
  },

  logout: async () => {
    const res = await api.post('/auth/logout', {});
    return res?.data;
  },

  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res?.data?.user;
  },
};
