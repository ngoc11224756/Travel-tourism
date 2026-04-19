// ===================== UC7 – Quản lý kế hoạch =====================
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getMyPlans, deletePlan } from "../services/planService";
import { createReview, getPlaceReviews } from "../services/reviewService";
import { getPlaceDetail } from "../services/placeService";

export function PlanManage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { placeId } = useParams();
  const [stars, setStars] = useState(0);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getMyPlans();
        setPlans(data);
      } catch (err) {
        console.error("Không tải được kế hoạch");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleDelete = async (planId) => {
    if (!confirm("Bạn có chắc muốn xóa kế hoạch này?")) return;
    try {
      await deletePlan(planId);
      setPlans((prev) => prev.filter((p) => p.id !== planId));
    } catch (err) {
      alert("Xóa thất bại");
    }
  };
  const handleSubmit = async () => {
    if (!stars) return alert("Vui lòng chọn số sao!");
    setSubmitting(true);
    try {
      await createReview({ place_id: placeId, rating: stars, title, comment });
      navigate(-1);
    } catch (e) {
      alert("Gửi đánh giá thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <div className="screen-title">Kế hoạch của tôi</div>
          <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 4 }}>
            Xem, chỉnh sửa và xoá các kế hoạch đã tạo
          </div>
        </div>
      </div>
      <div className="screen-body">
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate("/plan/create")}
          >
            ＋ Tạo kế hoạch mới
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "var(--text2)" }}>
            Đang tải...
          </div>
        ) : plans.length === 0 ? (
          <div
            style={{ textAlign: "center", color: "var(--text2)", padding: 40 }}
          >
            Chưa có kế hoạch nào. Hãy tạo kế hoạch đầu tiên!
          </div>
        ) : (
          plans.map((plan) => (
            <div key={plan.id} className="wire-solid" style={{ padding: 18 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>
                    {plan.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text2)",
                      marginTop: 4,
                    }}
                  >
                    📅 {plan.start_date || "Chưa có ngày"} · 📍{" "}
                    {plan.days?.length || 0} ngày
                  </div>
                </div>
                <span
                  className={`status ${plan.status === "draft" ? "pending" : "active"}`}
                >
                  {plan.status === "draft" ? "Bản nháp" : "Hoạt động"}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate(`/plan/view/${plan.id}`)}
                >
                  👁 Xem
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate(`/plan/edit/${plan.id}`)}
                >
                  ✏️ Chỉnh sửa
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(plan.id)}
                >
                  🗑 Xoá
                </button>
                <button
                  className="btn btn-sm ai-glow"
                  style={{
                    background: "rgba(79,142,247,0.15)",
                    color: "var(--accent)",
                    border: "1px solid rgba(79,142,247,0.3)",
                  }}
                  onClick={() => navigate("/chat")}
                >
                  🤖 Tư vấn AI
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// UC9 – Chat AI

const quickPrompts = [
  "Gợi ý địa điểm gần đây",
  "Lịch trình 2 ngày",
  "Ăn gì ở Hà Nội?",
];

const initMessages = [
  {
    role: "ai",
    text: "Xin chào! Tôi là trợ lý du lịch AI. Bạn muốn khám phá địa điểm nào hôm nay?",
    time: "10:30",
  },
  {
    role: "user",
    text: "Tôi có 2 ngày ở Hà Nội, muốn tham quan lịch sử và ăn phở ngon, gợi ý cho tôi với?",
    time: "10:31",
  },
  {
    role: "ai",
    text: "Tuyệt! Với 2 ngày ở Hà Nội, tôi gợi ý:\n🌅 Ngày 1: Văn Miếu → Phở Thìn Lò Đúc → Hồ Hoàn Kiếm\n🌄 Ngày 2: Hoàng Thành → Bún Chả Hương Liên → Phố Cổ",
    time: "10:32",
  },
];

export function ChatAI() {
  const [messages, setMessages] = useState(initMessages);
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text: input, time: "Vừa xong" },
    ]);
    setInput("");
    // TODO: gọi API chatbot thật tại đây
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Đang xử lý câu hỏi của bạn...",
          time: "Vừa xong",
        },
      ]);
    }, 800);
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <div className="screen-title">Chat với AI</div>
          <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 4 }}>
            Đặt câu hỏi về du lịch · Tư vấn kế hoạch
          </div>
        </div>
        <div className="uc-badge">UC9 – Chat AI Chatbot</div>
      </div>

      <div className="screen-body" style={{ height: "calc(100vh - 120px)" }}>
        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              {msg.role === "ai" && (
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "rgba(79,142,247,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  🤖
                </div>
              )}
              <div>
                <div
                  className={`chat-bubble ${msg.role}`}
                  style={{ whiteSpace: "pre-line" }}
                >
                  {msg.text}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--text2)",
                    marginTop: 4,
                    textAlign: msg.role === "user" ? "right" : "left",
                  }}
                >
                  {msg.time}
                </div>
                {msg.role === "ai" && i === 2 && (
                  <button
                    className="btn btn-sm ai-glow"
                    style={{
                      marginTop: 8,
                      background: "rgba(79,142,247,0.15)",
                      color: "var(--accent)",
                      border: "1px solid rgba(79,142,247,0.3)",
                      fontSize: 12,
                    }}
                    onClick={() => navigate("/plan/create")}
                  >
                    📋 Tạo kế hoạch từ gợi ý này
                  </button>
                )}
              </div>
              {msg.role === "user" && (
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "var(--surface2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  👤
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
          <div className="search-bar">
            <input
              className="search-input"
              placeholder="Nhập câu hỏi về du lịch..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button className="btn btn-primary btn-sm" onClick={send}>
              Gửi ↑
            </button>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {quickPrompts.map((p) => (
              <button
                key={p}
                className="tag"
                style={{ fontSize: 11 }}
                onClick={() => setInput(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================== UC10 – Viết đánh giá =====================
export function WriteReview() {
  const navigate = useNavigate();
  const { placeId } = useParams();
  const [stars, setStars] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ✅ Load thông tin địa điểm từ API theo placeId
  const [place, setPlace] = useState(null);
  const [loadingPlace, setLoadingPlace] = useState(true);

  useEffect(() => {
    if (!placeId) return;
    setLoadingPlace(true);
    getPlaceDetail(placeId)
      .then(setPlace)
      .catch(() => setPlace(null))
      .finally(() => setLoadingPlace(false));
  }, [placeId]);

  const handleSubmit = async () => {
    if (!stars) return alert("Vui lòng chọn số sao!");
    setSubmitting(true);
    try {
      await createReview({
        place_id: placeId,
        rating: stars,
        content: comment,
      });
      navigate(-1);
    } catch (e) {
      console.log("Error:", e.response?.data);
      alert("Gửi đánh giá thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <div className="screen-title">Viết đánh giá</div>
          <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 4 }}>
            Chia sẻ trải nghiệm của bạn về địa điểm
          </div>
        </div>
        <div className="uc-badge">UC10 – Viết đánh giá</div>
      </div>

      <div className="screen-body">
        {/* ✅ Hiển thị đúng tên địa điểm từ API */}
        <div
          className="wire-solid"
          style={{
            padding: 12,
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 28 }}>📍</div>
          <div>
            {loadingPlace ? (
              <div style={{ color: "var(--text2)", fontSize: 13 }}>
                Đang tải địa điểm...
              </div>
            ) : place ? (
              <>
                <div style={{ fontWeight: 600 }}>{place.name}</div>
                <div style={{ fontSize: 12, color: "var(--text2)" }}>
                  {place.categories?.[0]?.name ?? ""}
                  {place.categories?.[0]?.name && place.address ? " · " : ""}
                  {place.address ?? place.city}
                </div>
              </>
            ) : (
              <div style={{ color: "var(--text2)", fontSize: 13 }}>
                Không tìm thấy địa điểm
              </div>
            )}
          </div>
        </div>

        {/* Chọn sao */}
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <span
              key={s}
              style={{
                fontSize: 32,
                cursor: "pointer",
                color: s <= stars ? "var(--accent2)" : "var(--border)",
                transition: "color 0.15s",
              }}
              onClick={() => setStars(s)}
            >
              ★
            </span>
          ))}
        </div>

        <div className="field">
          <label>Nội dung chi tiết</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            placeholder="Kể về chuyến đi..."
          />
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Huỷ
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "⏳ Đang gửi..." : "📤 Gửi đánh giá"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ViewReview() {
  const navigate = useNavigate();
  const { placeId } = useParams();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (placeId) {
      getPlaceReviews(placeId).then(setReviews).catch(console.error);
    }
  }, [placeId]);
  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <div className="screen-title">Đánh giá địa điểm</div>
          <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 4 }}>
            Phở Thìn Lò Đúc · 342 đánh giá
          </div>
        </div>
        <div className="uc-badge">UC11 – Xem đánh giá</div>
      </div>
      <div className="screen-body">
        {/* Summary */}
        <div className="wire-solid" style={{ padding: 16 }}>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 48,
                  color: "var(--accent2)",
                  lineHeight: 1,
                }}
              >
                4.9
              </div>
              <div style={{ color: "var(--accent2)", fontSize: 18 }}>★★★★★</div>
              <div style={{ fontSize: 11, color: "var(--text2)" }}>
                342 đánh giá
              </div>
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              {[
                ["5★", "85%", 290],
                ["4★", "12%", 40],
                ["3★", "4%", 12],
              ].map(([label, pct, count]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                  }}
                >
                  <span style={{ width: 16 }}>{label}</span>
                  <div
                    style={{
                      flex: 1,
                      height: 6,
                      background: "var(--surface2)",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: pct,
                        height: "100%",
                        background: "var(--accent2)",
                        borderRadius: 3,
                      }}
                    />
                  </div>
                  <span style={{ color: "var(--text2)" }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {reviews.map((r, i) => (
            <div key={i} className="wire-solid" style={{ padding: 14 }}>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "var(--surface2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  👤
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {r.user?.full_name || "Ẩn danh"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text2)" }}>
                    {"★".repeat(r.stars)}
                    {"☆".repeat(5 - r.stars)} ·{" "}
                    {new Date(r.created_at).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>
              <div
                style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}
              >
                {r.comment}
              </div>
            </div>
          ))}
        </div>

        <button
          className="btn btn-primary"
          style={{ alignSelf: "flex-start" }}
          onClick={() => navigate(`/review/write/${placeId}`)}
        >
          ✍ Viết đánh giá của bạn
        </button>
      </div>
    </div>
  );
}
