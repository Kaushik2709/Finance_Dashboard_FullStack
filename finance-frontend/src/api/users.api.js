import { api } from './fetch.js';

const mapUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  active: user.is_active ?? user.isActive,
  createdAt: user.created_at ?? user.createdAt,
});

export const usersAPI = {
  getUsers: async (params) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await api.get(`/users${query}`);
    return {
      users: (res?.data?.users || []).map(mapUser),
      meta: res?.meta,
    };
  },

  getUser: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res?.data?.user ? mapUser(res.data.user) : null;
  },

  createUser: async (data) => {
    const res = await api.post('/users', data);
    return res?.data?.user ? mapUser(res.data.user) : null;
  },

  updateUser: async (id, data) => {
    const res = await api.patch(`/users/${id}`, data);
    return res?.data?.user ? mapUser(res.data.user) : null;
  },

  updateRole: async (id, role) => {
    const res = await api.patch(`/users/${id}/role`, { role });
    return res?.data?.user ? mapUser(res.data.user) : null;
  },

  toggleActive: async (id) => {
    const res = await api.patch(`/users/${id}/status`, {});
    return res?.data?.user ? mapUser(res.data.user) : null;
  },
};
