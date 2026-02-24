import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import type { Notification } from '../../types';

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk<
  Notification[],
  void,
  { rejectValue: string }
>(
  'notifications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Notification[]>('/notifications');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch notifications';
      return rejectWithValue(message);
    }
  }
);

export const markAsRead = createAsyncThunk<
  Notification,
  string,
  { rejectValue: string }
>(
  'notifications/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch<Notification>(`/notifications/${id}/read`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to mark notification as read';
      return rejectWithValue(message);
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk<
void,
void,
{ rejectValue: string }
>(
'notifications/markAllAsRead',
async (_, { rejectWithValue }) => {
  try {
    await api.patch('/notifications/read-all');
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to mark all notifications as read';
    return rejectWithValue(message);
  }
}
);

export const deleteAllNotifications = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>(
  'notifications/deleteAll',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/notifications/clear-all');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete notifications';
      return rejectWithValue(message);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.notifications = []; // Clear current list while fetching for a "clean" look as requested
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unknown error';
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n._id === action.payload._id);
        if (index !== -1) {
          state.notifications[index] = action.payload;
        }
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
      })
      .addCase(deleteAllNotifications.pending, (state) => {
        state.notifications = []; // Optimistically clear
      })
      .addCase(deleteAllNotifications.fulfilled, () => {
        // Already cleared in pending
      });
  },
});

export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
