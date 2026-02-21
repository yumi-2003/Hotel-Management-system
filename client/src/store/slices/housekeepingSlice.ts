import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import type { HousekeepingLog, CreateHousekeepingRequest } from '../../types';

interface HousekeepingState {
  logs: HousekeepingLog[];
  loading: boolean;
  error: string | null;
}

const initialState: HousekeepingState = {
  logs: [],
  loading: false,
  error: null,
};

// Async thunks
export const createHousekeepingLog = createAsyncThunk<
  HousekeepingLog,
  CreateHousekeepingRequest,
  { rejectValue: string }
>(
  'housekeeping/create',
  async (logData, { rejectWithValue }) => {
    try {
      const response = await api.post<HousekeepingLog>('/housekeeping', logData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create housekeeping log';
      return rejectWithValue(message);
    }
  }
);

export const fetchHousekeepingLogs = createAsyncThunk<
  HousekeepingLog[],
  void,
  { rejectValue: string }
>(
  'housekeeping/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<HousekeepingLog[]>('/housekeeping');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch housekeeping logs';
      return rejectWithValue(message);
    }
  }
);

// Slice
const housekeepingSlice = createSlice({
  name: 'housekeeping',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create housekeeping log
    builder
      .addCase(createHousekeepingLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHousekeepingLog.fulfilled, (state, action: PayloadAction<HousekeepingLog>) => {
        state.loading = false;
        state.logs.push(action.payload);
      })
      .addCase(createHousekeepingLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create housekeeping log';
      });

    // Fetch housekeeping logs
    builder
      .addCase(fetchHousekeepingLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHousekeepingLogs.fulfilled, (state, action: PayloadAction<HousekeepingLog[]>) => {
        state.loading = false;
        state.logs = action.payload;
      })
      .addCase(fetchHousekeepingLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch housekeeping logs';
      });
  },
});

export const { clearError } = housekeepingSlice.actions;
export default housekeepingSlice.reducer;
