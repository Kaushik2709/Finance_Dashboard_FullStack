import { api } from './fetch.js';

const mapCategory = (category) => ({
  id: category.id,
  name: category.name,
  type: category.type,
  createdAt: category.created_at ?? category.createdAt,
});

export const categoriesAPI = {
  getCategories: async () => {
    const res = await api.get('/categories');
    const categories = res?.data?.categories || [];
    return categories.map(mapCategory);
  },

  getCategory: async (id) => {
    const res = await api.get(`/categories/${id}`);
    return res?.data?.category ? mapCategory(res.data.category) : null;
  },

  createCategory: async (data) => {
    const res = await api.post('/categories', data);
    return res?.data?.category ? mapCategory(res.data.category) : null;
  },

  updateCategory: async (id, data) => {
    const res = await api.put(`/categories/${id}`, data);
    return res?.data?.category ? mapCategory(res.data.category) : null;
  },
};
