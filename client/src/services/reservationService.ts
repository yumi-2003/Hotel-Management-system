import api from './api';

export const getAllReservations = async (params?: any) => {
  const response = await api.get('/reservations', { params });
  return response.data;
};

export const updateReservationStatus = async (id: string, status: string) => {
  const response = await api.patch(`/reservations/${id}/status`, { status });
  return response.data;
};

export const getReservationById = async (id: string) => {
  const response = await api.get(`/reservations/${id}`);
  return response.data;
};
