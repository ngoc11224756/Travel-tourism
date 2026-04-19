import api from "../api/axios";


// ===== PLACES =====
export const getAdminPlaces = async (keyword = "") => {
  const response = await api.get("/places/search", {
    params: { keyword: keyword || undefined, limit: 100 },
  });
  return response.data;
};

export const createPlace = async (data) => {
  const response = await api.post("/places/", data);
  return response.data;
};

export const updatePlace = async (placeId, data) => {
  const response = await api.put(`/places/${placeId}`, data);
  return response.data;
};

export const deletePlace = async (placeId) => {
  const response = await api.delete(`/places/${placeId}`);
  return response.data;
};

// ===== REVIEWS =====
export const getReportedReviews = async () => {
  const response = await api.get("/reviews/reported");
  return response.data;
};

export const updateReviewStatus = async (reviewId, status) => {
  const response = await api.patch(`/reviews/${reviewId}/status`, { status });
  return response.data;
};

// ===== USERS =====
export const getAdminUsers = () => api.get("/users/").then((r) => r.data);
export const toggleUserBan = (id, status) =>
  api.patch(`/users/${id}/status`, { status }).then((r) => r.data);
export const deleteUser = (id) =>
  api.delete(`/users/${id}`).then((r) => r.data);

export const getAdminStats = () => api.get('/users/stats').then(r => r.data);