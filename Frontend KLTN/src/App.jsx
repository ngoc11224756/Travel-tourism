import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import "./styles/global.css";

// Auth pages – full screen, không có sidebar
import Login from "./pages/Login";
import Register from "./pages/Register";

// User pages
import Home from "./pages/Home";
import MapView from "./pages/MapView";
import Search from "./pages/Search";
import PlaceDetail from "./pages/PlaceDetail";
import { AIRecommend } from "./pages/AIRecommend";
import PlanCreate from "./pages/PlanCreate";
import { PlanManage, ChatAI, WriteReview, ViewReview } from "./pages/UserPages";
import Profile from "./pages/Profile";
// Admin pages
import {
  AdminLogin,
  PlaceManager,
  UserManager,
  ReviewManager,
  AdminStats,
} from "./pages/AdminPages";

// Layout chính – có sidebar + topbar
function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/search" element={<Search />} />
          <Route path="/place/:id" element={<PlaceDetail />} />
          <Route path="/ai" element={<AIRecommend />} />
          <Route path="/plan/create" element={<PlanCreate />} />
          <Route path="/plan/view/:id" element={<PlanCreate />} />
          <Route path="/plan/edit/:id" element={<PlanCreate />} />
          <Route path="/plan" element={<PlanManage />} />
          <Route path="/chat" element={<ChatAI />} />
          <Route path="/review/write/:placeId" element={<WriteReview />} />
          <Route path="/review/view/:placeId" element={<ViewReview />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/places" element={<PlaceManager />} />
          <Route path="/admin/users" element={<UserManager />} />
          <Route path="/admin/reviews" element={<ReviewManager />} />
          <Route path="/admin/stats" element={<AdminStats />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth pages – full screen, KHÔNG có sidebar */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Tất cả trang khác – có sidebar + topbar */}
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
