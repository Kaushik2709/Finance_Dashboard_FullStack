import { api } from './fetch.js';

const mapRecord = (record) => ({
  id: record.id,
  userId: record.user_id,
  categoryId: record.category_id,
  amount: record.amount,
  type: record.type,
  notes: record.notes,
  date: record.record_date,
  category: record.category?.name,
  raw: record,
});

export const recordsAPI = {
  getRecords: async (params) => {
    const mapped = {
      ...(params?.type ? { type: params.type } : {}),
      ...(params?.category ? { category_id: params.category } : {}),
      ...(params?.from ? { from: params.from } : {}),
      ...(params?.to ? { to: params.to } : {}),
      ...(params?.page ? { page: String(params.page) } : {}),
      ...(params?.limit ? { limit: String(params.limit) } : {}),
      ...(params?.sort ? { sort: params.sort } : {}),
    };

    const query = new URLSearchParams(mapped).toString();
    const res = await api.get(`/records${query ? `?${query}` : ''}`);
    return {
      records: (res?.data?.records || []).map(mapRecord),
      meta: res?.meta,
    };
  },

  getRecord: async (id) => {
    const res = await api.get(`/records/${id}`);
    return res?.data?.record ? mapRecord(res.data.record) : null;
  },

  createRecord: async (data) => {
    const payload = {
      category_id: data.category,
      amount: data.amount,
      type: data.type,
      notes: data.notes || undefined,
      record_date: data.date,
    };

    const res = await api.post('/records', payload);
    return res?.data?.record ? mapRecord(res.data.record) : null;
  },

  updateRecord: async (id, data) => {
    const payload = {
      category_id: data.category,
      amount: data.amount,
      type: data.type,
      notes: data.notes || undefined,
      record_date: data.date,
    };

    const res = await api.patch(`/records/${id}`, payload);
    return res?.data?.record ? mapRecord(res.data.record) : null;
  },

  deleteRecord: async (id) => {
    const res = await api.delete(`/records/${id}`);
    return res?.data?.record ? mapRecord(res.data.record) : null;
  },
};
