import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Dashboard
export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

// Users
export const getAllUsers = async (params?: any) => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const createStaffUser = async (data: {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
}) => {
  const response = await api.post('/users/staff', data);
  return response.data;
};

export const updateUserStatus = async (id: string, status: string) => {
  const response = await api.put(`/users/${id}/status`, { status });
  return response.data;
};

export const updateUserRole = async (id: string, role: string) => {
  const response = await api.put(`/users/${id}/role`, { role });
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export default api;
