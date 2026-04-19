import React, { useState } from 'react';
import { Card, Badge } from './Shared';
import { ACTIVITY } from './mockData';

export default function Timeline() {
  const [filter, setFilter] = useState("all");
  const filtered = ACTIVITY.filter(a => filter === "all" || a.type === filter);

  return (
    <div style={{ animation: "fadeUp .25s ease" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Total events", value: ACTIVITY.length, color: "#3b82f6" },
          { label: "Entries", value: ACTIVITY.filter(a => a.type === "entry").length, color: "#22c55e" },
          { label: "Exits", value: ACTIVITY.filter(a => a.type === "exit").length, color: "#64748b" },
          { label: "Denied", value: ACTIVITY.filter(a => a.type === "denied").length, color: "#ef4444" },
        ].map(s => (
          <Card key={s.label} style={{ padding: "12px 14px" }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "monospace" }}>{s.value}</p>
            <p style={{ margin: "3px 0 0", fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</p>
          </Card>
        ))}
      </div>

      <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 3, marginBottom: 14 }}>
        {["all", "entry", "exit", "denied"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? "rgba(59,130,246,0.12)" : "transparent", border: filter === f ? "1px solid rgba(59,130,246,0.25)" : "1px solid transparent", borderRadius: 6, padding: "5px 12px", color: filter === f ? "#3b82f6" : "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: filter === f ? 700 : 400, cursor: "pointer", textTransform: "capitalize" }}>{f}</button>
        ))}
      </div>

      <Card style={{ overflow: "hidden" }}>
        {filtered.map((a, i) => (
          <div key={a.id} style={{ padding: "13px 18px", borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: a.ok ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${a.ok ? "#10b981" : "#ef4444"}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: a.ok ? "#22c55e" : "#ef4444", flexShrink: 0 }}>{a.type === "entry" ? "↗" : a.type === "exit" ? "↙" : "✕"}</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{a.zone}</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{a.method} · {a.date} at {a.time}</p>
            </div>
            <Badge color={a.ok ? "#22c55e" : "#ef4444"} small>{a.type}</Badge>
          </div>
        ))}
      </Card>
    </div>
  );
}
