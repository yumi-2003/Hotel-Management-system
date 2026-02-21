import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import type { Reservation, CreateReservationRequest } from '../../types';

interface ReservationState {
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
}

const initialState: ReservationState = {
  reservations: [],
  loading: false,
  error: null,
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
  Reservation[],
  void,
  { rejectValue: string }
>(
  'reservations/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Reservation[]>('/reservations/my');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch reservations';
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
      .addCase(fetchMyReservations.fulfilled, (state, action: PayloadAction<Reservation[]>) => {
        state.loading = false;
        state.reservations = action.payload;
      })
      .addCase(fetchMyReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch reservations';
      });
  },
});

export const { clearError } = reservationSlice.actions;
export default reservationSlice.reducer;
