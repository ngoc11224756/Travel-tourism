import { useAuth } from '../context/AuthContext';
import HomeGuest from './HomeGuest';
import HomeLoggedIn from './HomeLoggedIn';

// Trang chủ tự động chọn đúng version dựa vào trạng thái login
export default function Home() {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <HomeLoggedIn /> : <HomeGuest />;
}
