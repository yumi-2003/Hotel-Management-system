import api from './api';
import type { Pool, UpdatePoolRequest, PoolSlot, PoolReservationData, CreatePoolReservationRequest } from '../types';

export const getPoolStatus = async (): Promise<Pool> => {
  const response = await api.get('/pool');
  return response.data;
};

export const updatePoolStatus = async (data: UpdatePoolRequest): Promise<Pool> => {
  const response = await api.put('/pool', data);
  return response.data;
};

export const getPoolSlots = async (date: string): Promise<PoolSlot[]> => {
  const response = await api.get(`/pool/slots?date=${date}`);
  return response.data;
};

export const reservePoolSlot = async (data: CreatePoolReservationRequest): Promise<PoolReservationData> => {
  const response = await api.post('/pool/reserve', data);
  return response.data;
};

export const cancelPoolReservation = async (id: string): Promise<any> => {
  const response = await api.patch(`/pool/reservation/${id}/cancel`);
  return response.data;
};
