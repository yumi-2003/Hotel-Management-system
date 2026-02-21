import api from './api';

export const getAllBookings = async (params?: any) => {
  const response = await api.get('/bookings', { params });
  return response.data;
};

export const updateBookingStatus = async (id: string, status: string) => {
  const response = await api.patch(`/bookings/${id}/status`, { status });
  return response.data;
};

export const getBookingById = async (id: string) => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};

export const confirmBookingPayment = async (id: string) => {
  const response = await api.post(`/bookings/${id}/confirm-payment`);
  return response.data;
};
