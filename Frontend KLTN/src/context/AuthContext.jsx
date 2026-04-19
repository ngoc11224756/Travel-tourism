import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, register as apiRegister } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // kiểm tra token lúc khởi động

  // Khi app khởi động — kiểm tra đã đăng nhập chưa
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (identifier, password) => {
    const data = await apiLogin(identifier, password);
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const data = await apiRegister(formData);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  if (loading) return null; // chờ kiểm tra token xong mới render

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
