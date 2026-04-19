import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import vi from "date-fns/locale/vi";

import { createPlan, getPlanDetail, updatePlan } from "../services/planService";
import PlanTemplates from "../components/plan/PlanTemplates";
import PlanStepList from "../components/plan/PlanStepList";
import RouteOptimizerModal from "../components/plan/RouteOptimizerModal.jsx";

registerLocale("vi", vi);

export default function PlanCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const location = useLocation();

  const isEdit = location.pathname.startsWith("/plan/edit");
  const isView = location.pathname.startsWith("/plan/view");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Khởi tạo steps từ URL params nếu có (từ PlaceDetail → "Thêm vào kế hoạch")
  const [steps, setSteps] = useState(() => {
    const placeId = searchParams.get("placeId");
    const placeName = searchParams.get("placeName");
    if (placeId && placeName) {
      return [{ id: placeId, name: decodeURIComponent(placeName), note: "" }];
    }
    return [];
  });

  // Load dữ liệu khi ở chế độ edit/view
  useEffect(() => {
    if (!isEdit && !isView) return;
    const fetchPlan = async () => {
      try {
        const data = await getPlanDetail(id);
        setTitle(data.title);
        setDescription(data.description || "");
        setStartDate(data.start_date ? new Date(data.start_date) : null);
        setEndDate(data.end_date ? new Date(data.end_date) : null);
        setSteps(data.steps || []);
      } catch {
        setError("Không tải được kế hoạch");
      }
    };
    fetchPlan();
  }, [id, isEdit, isView]);

  const formatDate = (date) =>
    date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      : null;

  const handleSave = async () => {
    if (!title) {
      setError("Vui lòng nhập tên kế hoạch");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        title,
        description,
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        steps,
        days: [],
      };
      if (isEdit) {
        await updatePlan(id, payload);
      } else {
        await createPlan(payload);
      }
      navigate("/plan");
    } catch {
      setError("Lưu kế hoạch thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <div className="screen-title">
            {isView ? "Xem kế hoạch" : isEdit ? "Chỉnh sửa kế hoạch" : "Tạo kế hoạch du lịch"}
          </div>
          <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 4 }}>
            Chọn lộ trình mẫu hoặc tự tạo thủ công
          </div>
        </div>
      </div>

      <div className="screen-body">
        {/* Lộ trình mẫu */}
        {!isView && <PlanTemplates onSelect={(t) => console.log("template selected:", t)} />}

        {/* Form tạo/chỉnh sửa */}
        <div>
          <div className="section-heading">
            {isView ? "Thông tin kế hoạch" : "Tự tạo kế hoạch thủ công"}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="grid-2">
              <div className="field">
                <label>Tên kế hoạch</label>
                <input
                  disabled={isView}
                  placeholder="VD: Hà Nội 3 ngày 2025"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Mô tả kế hoạch</label>
                <textarea
                  disabled={isView}
                  rows={3}
                  placeholder="VD: Khám phá các địa điểm lịch sử và ẩm thực đặc trưng..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Ngày bắt đầu</label>
                <DatePicker
                  disabled={isView}
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  dateFormat="dd/MM/yyyy"
                  locale="vi"
                  placeholderText="DD/MM/YYYY"
                  className="datepicker-input"
                />
              </div>
              <div className="field">
                <label>Ngày kết thúc</label>
                <DatePicker
                  disabled={isView}
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  dateFormat="dd/MM/yyyy"
                  locale="vi"
                  placeholderText="DD/MM/YYYY"
                  minDate={startDate}
                  className="datepicker-input"
                />
              </div>
            </div>

            {/* Danh sách địa điểm + nút tối ưu */}
            <PlanStepList steps={steps} setSteps={setSteps} isView={isView} />

            {/* Nút tối ưu lộ trình — chỉ hiện khi edit/create và có ≥ 2 địa điểm */}
            {!isView && (
              <RouteOptimizerModal steps={steps} setSteps={setSteps} />
            )}

            {error && <div className="auth-error">⚠️ {error}</div>}

            {!isView && (
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                  Huỷ
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                  {loading ? "Đang lưu..." : "💾 Lưu kế hoạch"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
