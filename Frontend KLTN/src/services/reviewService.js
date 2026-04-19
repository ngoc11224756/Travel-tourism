import api from "../api/axios";

// UC10 — Xem đánh giá của địa điểm
export const getPlaceReviews = async (placeId) => {
  const response = await api.get(`/reviews/place/${placeId}`);
  return response.data;
};

// UC9 — Viết đánh giá
export const createReview = async (data) => {
  const response = await api.post("/reviews/", data);
  return response.data;
};

// UC15 — Admin lấy danh sách chờ duyệt
export const getPendingReviews = async () => {
  const response = await api.get("/reviews/pending");
  return response.data;
};

// UC15 — Admin duyệt / ẩn / xóa đánh giá
export const updateReviewStatus = async (reviewId, status) => {
  const response = await api.patch(`/reviews/${reviewId}/status`, { status });
  return response.data;
};
