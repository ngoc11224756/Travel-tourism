import api from "../api/axios";

// UC1 — Lấy địa điểm hiển thị trên bản đồ
export const getMapPlaces = async (city = "Ha Noi") => {
  const response = await api.get("/places/map", { params: { city } });
  return response.data;
};

// UC2 — Tìm kiếm địa điểm
export const searchPlaces = async (params = {}) => {
  const response = await api.get("/places/search", { params });
  return response.data;
};

// UC3 — Xem chi tiết địa điểm
export const getPlaceDetail = async (placeId) => {
  const response = await api.get(`/places/${placeId}`);
  return response.data;
};

// UC12 — Admin tạo địa điểm
export const createPlace = async (data) => {
  const response = await api.post("/places/", data);
  return response.data;
};

// UC12 — Admin cập nhật địa điểm
export const updatePlace = async (placeId, data) => {
  const response = await api.put(`/places/${placeId}`, data);
  return response.data;
};

// UC12 — Admin xóa địa điểm
export const deletePlace = async (placeId) => {
  const response = await api.delete(`/places/${placeId}`);
  return response.data;
};
