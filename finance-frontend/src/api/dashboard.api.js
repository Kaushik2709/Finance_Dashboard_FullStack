import { api } from './fetch.js';

export const dashboardAPI = {
  getSummary: async (from, to) => {
    const query = new URLSearchParams({ ...(from ? { from } : {}), ...(to ? { to } : {}) }).toString();
    const res = await api.get(`/dashboard/summary${query ? `?${query}` : ''}`);
    return res?.data?.summary;
  },

  getByCategory: async (from, to) => {
    const query = new URLSearchParams({ ...(from ? { from } : {}), ...(to ? { to } : {}) }).toString();
    const res = await api.get(`/dashboard/by-category${query ? `?${query}` : ''}`);
    return res?.data?.categories || [];
  },

  getTrends: async (period = 'monthly') => {
    const query = new URLSearchParams({ period }).toString();
    const res = await api.get(`/dashboard/trends?${query}`);
    return res?.data?.trends || [];
  },

  getRecentRecords: async (limit = 10) => {
    const res = await api.get('/dashboard/recent');
    const records = res?.data?.records || [];
    return records.slice(0, limit);
  },
};
