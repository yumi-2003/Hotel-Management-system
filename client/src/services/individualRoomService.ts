import api from './api';

export const getAllRooms = async (params?: any) => {
  const response = await api.get('/rooms', { params });
  return response.data;
};

export const updateRoomStatus = async (id: string, status: string) => {
  const response = await api.patch(`/rooms/${id}/status`, { status });
  return response.data;
};

export const createRoom = async (data: any) => {
  const response = await api.post('/rooms', data);
  return response.data;
};
