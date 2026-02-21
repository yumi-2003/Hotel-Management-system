import api from './api';

export const getAllHousekeepingLogs = async (params?: any) => {
  const response = await api.get('/housekeeping', { params });
  return response.data;
};

export const updateHousekeepingStatus = async (id: string, status: string, note?: string, roomStatus?: string) => {
  const response = await api.patch(`/housekeeping/${id}/status`, { status, note, roomStatus });
  return response.data;
};

export const assignHousekeepingTask = async (id: string, staffId: string) => {
  const response = await api.patch(`/housekeeping/${id}/assign`, { staffId });
  return response.data;
};

export const createHousekeepingLog = async (data: any) => {
  const response = await api.post('/housekeeping', data);
  return response.data;
};
