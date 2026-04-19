import api from "../api/axios";

// UC_REGISTER — Đăng ký tài khoản
export const register = async (data) => {
  const response = await api.post("/auth/register", data);
  // Lưu token và thông tin user vào localStorage
  localStorage.setItem("token", response.data.token);
  localStorage.setItem("user", JSON.stringify(response.data.user));
  return response.data;
};

// UC_LOGIN — Đăng nhập
export const login = async (identifier, password) => {
  const response = await api.post("/auth/login", { identifier, password });
  localStorage.setItem("token", response.data.token);
  localStorage.setItem("user", JSON.stringify(response.data.user));
  return response.data;
};

// Đăng xuất
export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
};

// Lấy thông tin user hiện tại từ localStorage
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Kiểm tra đã đăng nhập chưa
export const isLoggedIn = () => {
  return !!localStorage.getItem("token");
};

// Kiểm tra có phải admin không
export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.role === "admin";
};
