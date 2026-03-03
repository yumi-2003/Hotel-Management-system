import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import type { Reservation, CreateReservationRequest } from '../../types';

interface ReservationState {
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReservations: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
}

const initialState: ReservationState = {
  reservations: [],
  loading: false,
  error: null,
  pagination: null,
};

// Async thunks
export const createReservation = createAsyncThunk<
  Reservation,
  CreateReservationRequest,
  { rejectValue: string }
>(
  'reservations/create',
  async (reservationData, { rejectWithValue }) => {
    try {
      const response = await api.post<Reservation>('/reservations', reservationData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create reservation';
      return rejectWithValue(message);
    }
  }
);

export const fetchMyReservations = createAsyncThunk<
  { reservations: Reservation[]; pagination: any },
  { page?: number; limit?: number } | void,
  { rejectValue: string }
>(
  'reservations/fetchMy',
  async (params, { rejectWithValue }) => {
    try {
      const page = params && 'page' in params ? params.page : 1;
      const limit = params && 'limit' in params ? params.limit : 10;
      const response = await api.get<{ reservations: Reservation[]; pagination: any }>(`/reservations/my?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch reservations';
      return rejectWithValue(message);
    }
  }
);

export const cancelReservation = createAsyncThunk<
  Reservation,
  string,
  { rejectValue: string }
>(
  'reservations/cancel',
  async (reservationId, { rejectWithValue }) => {
    try {
      const response = await api.patch<Reservation>(`/reservations/my/${reservationId}/cancel`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to cancel reservation';
      return rejectWithValue(message);
    }
  }
);

// Slice
const reservationSlice = createSlice({
  name: 'reservations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create reservation
    builder
      .addCase(createReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReservation.fulfilled, (state, action: PayloadAction<Reservation>) => {
        state.loading = false;
        state.reservations.push(action.payload);
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create reservation';
      });

    // Fetch my reservations
    builder
      .addCase(fetchMyReservations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyReservations.fulfilled, (state, action: PayloadAction<{ reservations: Reservation[]; pagination: any }>) => {
        state.loading = false;
        state.reservations = action.payload.reservations;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch reservations';
      });

    // Cancel reservation
    builder
      .addCase(cancelReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelReservation.fulfilled, (state, action: PayloadAction<Reservation>) => {
        state.loading = false;
        const index = state.reservations.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.reservations[index] = action.payload;
        }
      })
      .addCase(cancelReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to cancel reservation';
      });
  },
});

export const { clearError } = reservationSlice.actions;
export default reservationSlice.reducer;
