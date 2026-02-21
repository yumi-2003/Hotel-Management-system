import api from './api';
import type { RoomType } from '../types';

interface RoomTypeResponse {
  roomTypes: RoomType[];
  total: number;
  page: number;
  pages: number;
}

export const getAllRoomTypes = async (params?: any): Promise<RoomTypeResponse> => {
  const response = await api.get('/rooms/types', { params });
  return response.data;
};

export const createRoomType = async (data: any): Promise<RoomType> => {
  const response = await api.post('/rooms/types', data);
  return response.data;
};

export const updateRoomType = async (id: string, data: any): Promise<RoomType> => {
  const response = await api.put(`/rooms/types/${id}`, data);
  return response.data;
};

export const deleteRoomType = async (id: string): Promise<any> => {
  const response = await api.delete(`/rooms/types/${id}`);
  return response.data;
};

export const getRoomTypeById = async (id: string): Promise<RoomType> => {
  const response = await api.get(`/rooms/types/${id}`);
  return response.data;
};

export const getAllAmenities = async (): Promise<any[]> => {
  const response = await api.get('/rooms/amenities');
  return response.data;
};

export const createAmenity = async (data: any): Promise<any> => {
  const response = await api.post('/rooms/amenities', data);
  return response.data;
};

export const updateAmenity = async (id: string, data: any): Promise<any> => {
  const response = await api.put(`/rooms/amenities/${id}`, data);
  return response.data;
};

export const deleteAmenity = async (id: string): Promise<any> => {
  const response = await api.delete(`/rooms/amenities/${id}`);
  return response.data;
};

// Reviews
export const getReviewsByRoomType = async (roomTypeId: string): Promise<any[]> => {
  const response = await api.get(`/rooms/reviews/${roomTypeId}`);
  return response.data;
};

export const createReview = async (reviewData: any): Promise<any> => {
  const response = await api.post('/rooms/reviews', reviewData);
  return response.data;
};

export const deleteReview = async (id: string): Promise<any> => {
  const response = await api.delete(`/rooms/reviews/${id}`);
  return response.data;
};

export const getAllReviews = async (): Promise<any[]> => {
  const response = await api.get('/rooms/reviews');
  return response.data;
};
