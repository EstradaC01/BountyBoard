"use client";

export default function SkeletonCard() {
  const bar = (w: string | number, h = 14, mb = 0) => (
    <div style={{ width: w, height: h, backgroundColor: "#e2e8f0", borderRadius: 6, marginBottom: mb, flexShrink: 0 }} />
  );

  return (
    <div style={{ backgroundColor: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: 24, marginBottom: 16 }}>
      {/* Title + badge row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        {bar("60%", 20)}
        {bar(64, 22)}
      </div>
      {/* Amount */}
      {bar("35%", 36, 24)}
      {/* Info rows */}
      {[100, 90, 95, 88, 92].map((w, i) => (
        <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
          {bar(80, 13)}
          {bar(`${w}%`, 13)}
        </div>
      ))}

      <style>{`
        @keyframes shimmer {
          0%   { opacity: 0.5; }
          50%  { opacity: 1; }
          100% { opacity: 0.5; }
        }
        .skeleton-card > * { animation: shimmer 1.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
