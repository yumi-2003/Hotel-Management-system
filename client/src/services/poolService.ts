import api from './api';
import type { Pool, UpdatePoolRequest } from '../types';

export const getPoolStatus = async (): Promise<Pool> => {
  const response = await api.get('/pool');
  return response.data;
};

export const updatePoolStatus = async (data: UpdatePoolRequest): Promise<Pool> => {
  const response = await api.put('/pool', data);
  return response.data;
};
