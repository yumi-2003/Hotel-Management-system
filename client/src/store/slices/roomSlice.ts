import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import type { Room, RoomType, Amenity, RoomTypeResponse } from '../../types';

interface RoomState {
  rooms: Room[];
  roomTypes: RoomType[];
  amenities: Amenity[];
  loading: boolean;
  error: string | null;
}

const initialState: RoomState = {
  rooms: [],
  roomTypes: [],
  amenities: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchRooms = createAsyncThunk<
  Room[],
  { checkIn?: string; checkOut?: string; guests?: number } | undefined,
  { rejectValue: string }
>(
  'rooms/fetchRooms',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get<Room[]>('/rooms', { params });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch rooms';
      return rejectWithValue(message);
    }
  }
);

export const fetchRoomTypes = createAsyncThunk<
  RoomTypeResponse,
  void,
  { rejectValue: string }
>(
  'rooms/fetchRoomTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<RoomTypeResponse>('/rooms/types');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch room types';
      return rejectWithValue(message);
    }
  }
);

export const fetchAmenities = createAsyncThunk<
  Amenity[],
  void,
  { rejectValue: string }
>(
  'rooms/fetchAmenities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Amenity[]>('/rooms/amenities');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch amenities';
      return rejectWithValue(message);
    }
  }
);

export const updateRoomStatus = createAsyncThunk<
  Room,
  { id: string; status: string },
  { rejectValue: string }
>(
  'rooms/updateRoomStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch<Room>(`/rooms/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update room status';
      return rejectWithValue(message);
    }
  }
);

// Slice
const roomSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch rooms
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action: PayloadAction<Room[]>) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch rooms';
      });

    // Fetch room types
    builder
      .addCase(fetchRoomTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoomTypes.fulfilled, (state, action: PayloadAction<RoomTypeResponse>) => {
        state.loading = false;
        state.roomTypes = action.payload.roomTypes;
      })
      .addCase(fetchRoomTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch room types';
      });

    // Fetch amenities
    builder
      .addCase(fetchAmenities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAmenities.fulfilled, (state, action: PayloadAction<Amenity[]>) => {
        state.loading = false;
        state.amenities = action.payload;
      })
      .addCase(fetchAmenities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch amenities';
      });

    // Update room status
    builder
      .addCase(updateRoomStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRoomStatus.fulfilled, (state, action: PayloadAction<Room>) => {
        state.loading = false;
        const index = state.rooms.findIndex(room => room._id === action.payload._id);
        if (index !== -1) {
          state.rooms[index] = action.payload;
        }
      })
      .addCase(updateRoomStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update room status';
      });
  },
});

export const { clearError } = roomSlice.actions;
export default roomSlice.reducer;
