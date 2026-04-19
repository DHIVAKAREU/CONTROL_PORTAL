import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, SLabel, Spark, Badge } from './Shared';
import { ZONES, ACTIVITY } from './mockData';

const getHour = () => new Date().getHours();
const greeting = () => getHour() < 12 ? "Good morning" : getHour() < 17 ? "Good afternoon" : "Good evening";

export default function Dashboard({ onNav, user }: any) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(n => n + 1), 5000); return () => clearInterval(t); }, []);
  const grantedZones = ZONES.filter(z => z.status === "granted");
  const deniedToday = ACTIVITY.filter(a => a.date === "Today" && !a.ok).length;
  const SPARK = [3, 7, 5, 12, 8, 16, 11, 9, 14, 18, 13, 10];

  return (
    <div style={{ animation: "fadeUp .25s ease" }}>
      <Card style={{ padding: "18px 22px", marginBottom: 18, display: "flex", alignItems: "center", gap: 16 }} highlight>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#3b82f6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>👋</div>
        <div>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{greeting()}, {user?.name?.split(" ")[0]}.</p>
          <p style={{ margin: "3px 0 0", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
            You have <span style={{ color: "#3b82f6", fontWeight: 700 }}>{grantedZones.length} active zones</span> and <span style={{ color: "#22c55e", fontWeight: 700 }}>pass valid</span>. Predicted next: <span style={{ color: "#3b82f6" }}>R&D Hub</span>.
          </p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={() => onNav("pass")} style={{ background: "#3b82f6", border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Open Full Pass</button>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 18 }}>
        {[
          { label: "Active Zones", value: grantedZones.length, color: "#22c55e", spark: SPARK },
          { label: "Today's Events", value: ACTIVITY.filter(a => a.date === "Today").length, color: "#3b82f6", spark: SPARK.map(v => v * 0.8) },
          { label: "Denied (today)", value: deniedToday, color: "#ef4444", spark: [1, 0, 2, 0, 0, 1, 3, 1, 0, 2, 1, 0] },
          { label: "Pass Clearance", value: `Lvl ${user?.clearanceLevel || 1}`, color: "#a78bfa", spark: null },
        ].map(s => (
          <Card key={s.label} style={{ padding: "14px 16px" }}>
            <SLabel>{s.label}</SLabel>
            <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: s.color, fontFamily: "monospace", letterSpacing: "-0.04em", lineHeight: 1 }}>{s.value}</p>
            {s.spark && <div style={{ marginTop: 8, opacity: .7 }}><Spark data={s.spark} color={s.color} /></div>}
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px 1fr", gap: 14, marginBottom: 14 }}>
        <Card style={{ padding: "18px 20px" }}>
          <SLabel>System Status</SLabel>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
            <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#22c55e" }}>Optimal</p>
          </div>
          {[
            { label: "Subsystem nodes", value: "12/12", color: "#22c55e" },
            { label: "Encryption", value: "AES-256", color: "#3b82f6" },
            { label: "Auth tunnel", value: "Active", color: "#22c55e" },
            { label: "Last sync", value: `${tick * 5}s ago`, color: "rgba(255,255,255,0.5)" },
          ].map(r => (
            <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{r.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: r.color }}>{r.value}</span>
            </div>
          ))}
        </Card>

        <Card style={{ padding: "18px 20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", justifyContent: "center" }}>
          <SLabel>Digital Pass</SLabel>
          <div style={{ padding: 6, background: "#fff", borderRadius: 10, display: "inline-block", boxShadow: "0 0 20px rgba(59,130,246,0.2)" }}>
            <QRCodeSVG 
              value={`sacp:auth/${user?.id || 'guest'}:${user?.org || 'cit'}`}
              size={120}
              level="H"
              includeMargin={false}
            />
          </div>
          <p style={{ margin: "12px 0 0", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>Scan at any terminal</p>
          <div style={{ marginTop: 10, display: "flex", gap: 4 }}>
             <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e" }} />
             <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", opacity: 0.5 }} />
             <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", opacity: 0.2 }} />
          </div>
        </Card>

        <Card style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <SLabel>Zone Access</SLabel>
            <button onClick={() => onNav("zones")} style={{ background: "none", border: "none", color: "#3b82f6", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>View all →</button>
          </div>
          {ZONES.slice(0, 4).map(z => (
            <div key={z.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: z.status === "granted" ? "#22c55e" : "#ef4444", flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>{z.name}</span>
              <code style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{z.code}</code>
              <Badge color={z.status === "granted" ? "#22c55e" : "#ef4444"} small>{z.status}</Badge>
            </div>
          ))}
        </Card>
      </div>

      <Card style={{ overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "blink 2s ease-in-out infinite" }} />
            <SLabel>Mission Log / Activity</SLabel>
          </div>
          <button onClick={() => onNav("timeline")} style={{ background: "none", border: "none", color: "#3b82f6", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Full timeline →</button>
        </div>
        {ACTIVITY.slice(0, 5).map((a, i) => (
          <div key={a.id} style={{ padding: "11px 18px", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: a.ok ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", border: `1px solid ${a.ok ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>
              {a.type === "entry" ? "↗" : a.type === "exit" ? "↙" : "✕"}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700 }}>{a.zone}</p>
              <p style={{ margin: "1px 0 0", fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{a.method} · {a.date} {a.time}</p>
            </div>
            <Badge color={a.ok ? "#22c55e" : "#ef4444"} small>{a.type}</Badge>
          </div>
        ))}
      </Card>
    </div>
  );
}
