import React from 'react';

export function Toggle({ on, onChange, color = "#3b82f6" }: any) {
  return (
    <div onClick={() => onChange(!on)} style={{ width: 40, height: 22, borderRadius: 11, background: on ? color : "rgba(255,255,255,0.1)", position: "relative", cursor: "pointer", flexShrink: 0, transition: "background .2s" }}>
      <div style={{ position: "absolute", top: 3, left: on ? 20 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
    </div>
  );
}

export function Badge({ children, color = "#3b82f6", small }: any) {
  return <span style={{ fontSize: small ? 9 : 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", padding: small ? "2px 6px" : "3px 9px", borderRadius: 4, background: `${color}1a`, color, border: `1px solid ${color}33` }}>{children}</span>;
}

export function Card({ children, style, onClick, highlight }: any) {
  return (
    <div onClick={onClick} style={{ background: highlight ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${highlight ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.07)"}`, borderRadius: 14, ...style, cursor: onClick ? "pointer" : undefined }} >
      {children}
    </div>
  );
}

export function SLabel({ children }: any) {
  return <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>{children}</p>;
}

export function Spark({ data, color = "#3b82f6", h = 28 }: any) {
  const max = Math.max(...data), w = 80;
  const pts = data.map((v: number, i: number) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: h, display: "block" }} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" opacity=".7" />
    </svg>
  );
}
