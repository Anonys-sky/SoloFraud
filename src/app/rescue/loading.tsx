export default function RescueLoading() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", gap: 6 }}>
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
      <p style={{ fontSize: 14, color: "#9aabb8", marginTop: 8 }}>Loading autonomous rescue…</p>
    </div>
  );
}
