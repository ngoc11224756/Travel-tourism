import { useRef } from "react";

export default function PlanStepList({ steps, setSteps, isView }) {
  const dragIndex = useRef(null);

  const handleDragStart = (i) => {
    dragIndex.current = i;
  };

  const handleDrop = (i) => {
    const newSteps = [...steps];
    const dragged = newSteps.splice(dragIndex.current, 1)[0];
    newSteps.splice(i, 0, dragged);
    setSteps(newSteps);
    dragIndex.current = null;
  };

  const updateNote = (id, note) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, note } : s)));
  };

  const removeStep = (id) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div>
      <div style={{ fontSize: 12, color: "var(--text2)", fontWeight: 600, marginBottom: 8 }}>
        Các địa điểm đã thêm
        {steps.length > 1 && (
          <span style={{ fontWeight: 400, marginLeft: 6 }}>· kéo thả để sắp xếp</span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {steps.map((step, i) => (
          <div
            key={step.id}
            draggable={!isView}
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
            className="plan-step"
            style={{
              flexDirection: "column",
              gap: 8,
              cursor: isView ? "default" : "grab",
              alignItems: "stretch",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {!isView && (
                <span style={{ fontSize: 14, color: "var(--text2)", cursor: "grab" }}>⠿</span>
              )}
              <div className="step-num">{i + 1}</div>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{step.name}</div>
              {!isView && (
                <button className="btn btn-danger btn-sm" onClick={() => removeStep(step.id)}>
                  ✕
                </button>
              )}
            </div>

            {/* Note */}
            {isView ? (
              step.note && (
                <div style={{ fontSize: 12, color: "var(--text2)", paddingLeft: 4 }}>
                  {step.note}
                </div>
              )
            ) : (
              <textarea
                rows={2}
                placeholder="Ghi chú cho địa điểm này... (tuỳ chọn)"
                value={step.note}
                onChange={(e) => updateNote(step.id, e.target.value)}
                style={{
                  fontSize: 12,
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: "var(--surface2)",
                  color: "var(--text2)",
                  resize: "vertical",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {!isView && (
        <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }}>
          ＋ Thêm địa điểm
        </button>
      )}
    </div>
  );
}
