"use client";

export default function SkeletonCard() {
  const bar = (w: string | number, h = 14, mb = 0) => (
    <div style={{ width: w, height: h, backgroundColor: "#1f1f1d", borderRadius: 4, marginBottom: mb, flexShrink: 0 }} />
  );

  return (
    <div style={{ backgroundColor: "#141414", borderRadius: 8, border: "1px solid #222220", padding: 24, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        {bar("60%", 20)}
        {bar(64, 22)}
      </div>
      {bar("35%", 40, 24)}
      {[100, 90, 95, 88, 92].map((w, i) => (
        <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #1a1a18" }}>
          {bar(80, 13)}
          {bar(`${w}%`, 13)}
        </div>
      ))}

      <style>{`
        @keyframes shimmer {
          0%   { opacity: 0.4; }
          50%  { opacity: 0.8; }
          100% { opacity: 0.4; }
        }
        .skeleton-pulse > div { animation: shimmer 1.6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
