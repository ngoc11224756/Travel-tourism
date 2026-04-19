import api from "../api/axios";

// UC6 — Lấy danh sách kế hoạch
export const getMyPlans = async () => {
  const response = await api.get("/plans/");
  return response.data;
};

// UC6 — Xem chi tiết kế hoạch
export const getPlanDetail = async (planId) => {
  const response = await api.get(`/plans/${planId}`);
  return response.data;
};

export const getRecentViewed = () => Promise.resolve({ data: [] });
// UC5 — Tạo kế hoạch mới
export const createPlan = async (data) => {
  const response = await api.post("/plans/", data);
  return response.data;
};

// UC6 — Cập nhật kế hoạch
export const updatePlan = async (planId, data) => {
  const response = await api.put(`/plans/${planId}`, data);
  return response.data;
};

// UC6 — Xóa kế hoạch
export const deletePlan = async (planId) => {
  const response = await api.delete(`/plans/${planId}`);
  return response.data;
};
