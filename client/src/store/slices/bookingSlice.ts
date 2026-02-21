import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import type { Booking, CreateBookingRequest } from '../../types';

interface BookingState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  loading: false,
  error: null,
};

// Async thunks
export const createBooking = createAsyncThunk<
  Booking,
  CreateBookingRequest,
  { rejectValue: string }
>(
  'bookings/create',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await api.post<Booking>('/bookings', bookingData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create booking';
      return rejectWithValue(message);
    }
  }
);

export const fetchBookings = createAsyncThunk<
  Booking[],
  void,
  { rejectValue: string }
>(
  'bookings/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Booking[]>('/bookings');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch bookings';
      return rejectWithValue(message);
    }
  }
);

export const fetchMyBookings = createAsyncThunk<
  Booking[],
  void,
  { rejectValue: string }
>(
  'bookings/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Booking[]>('/bookings/my');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch your bookings';
      return rejectWithValue(message);
    }
  }
);

// Slice
const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create booking
    builder
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.loading = false;
        state.bookings.push(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create booking';
      });

    // Fetch all bookings (staff)
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch bookings';
      });

    // Fetch my bookings (guest)
    builder
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch your bookings';
      });
  },
});

export const { clearError } = bookingSlice.actions;
export default bookingSlice.reducer;
