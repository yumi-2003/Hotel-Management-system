import api from "./api";

export const getAllRooms = async (params?: any) => {
  const response = await api.get("/rooms", { params });
  return response.data;
};

export const updateRoomStatus = async (id: string, status: string) => {
  const response = await api.patch(`/rooms/${id}/status`, { status });
  return response.data;
};

export const createRoom = async (data: any) => {
  const response = await api.post("/rooms", data);
  return response.data;
};

export const createMultipleRooms = async (data: {
  roomTypeId: string;
  count: number;
  startRoomNumber?: number;
  floor?: number;
}) => {
  const response = await api.post("/rooms/bulk", data);
  return response.data;
};

export const getRoomCountByType = async () => {
  const response = await api.get("/rooms/count-by-type");
  return response.data;
};
