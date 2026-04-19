import React, { useState } from 'react';
import { Card, Badge } from './Shared';
import { ZONES } from './mockData';

export default function AreaAccess() {
  const [selected, setSelected] = useState<string | null>(null);
  const sel = selected ? ZONES.find(z => z.id === selected) : null;

  return (
    <div style={{ animation: "fadeUp .25s ease" }}>
      {/* Zone Grid - Always 3 columns */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {ZONES.map(z => {
          const granted = z.status === "granted";
          return (
            <Card 
              key={z.id} 
              style={{ padding: "18px 16px" }} 
              onClick={() => setSelected(z.id)} 
              highlight={selected === z.id}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: granted ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.08)", border: `1px solid ${granted ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.25)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                  {granted ? "🔓" : "🔒"}
                </div>
                <Badge color={granted ? "#22c55e" : "#ef4444"} small>{z.status}</Badge>
              </div>
              <p style={{ margin: "0 0 2px", fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>{z.code}</p>
              <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 800 }}>{z.name}</p>
              <p style={{ margin: "0 0 12px", fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{z.type}</p>
              <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${(z.occ / z.cap) * 100}%`, background: granted ? "#22c55e" : "#ef4444", borderRadius: 2 }} />
              </div>
              <p style={{ margin: "4px 0 0", fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{z.occ}/{z.cap} capacity · Floor {z.floor}</p>
            </Card>
          );
        })}
      </div>

      {/* Detail Pop-up (Modal) */}
      {sel && (
        <div 
          onClick={() => setSelected(null)}
          style={{ 
            position: "fixed", 
            inset: 0, 
            background: "rgba(0,0,0,0.7)", 
            backdropFilter: "blur(4px)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            zIndex: 1000,
            animation: "fadeDown .2s ease-out" 
          }}
        >
          <Card 
            onClick={(e: any) => e.stopPropagation()} 
            style={{ 
              width: 400, 
              padding: "24px", 
              background: "#0d1524",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)", 
              border: "1px solid rgba(255,255,255,0.12)" 
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{sel.name}</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>ZONE DETAILS / {sel.code}</p>
              </div>
              <button 
                onClick={() => setSelected(null)} 
                style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: "50%", width: 30, height: 30, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >✕</button>
            </div>
            
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10 }}>
              {[
                ["Personnel Occupancy", `${sel.occ} / ${sel.cap}`],
                ["Facility Floor", `Floor ${sel.floor}`],
                ["Access Hours", sel.hours],
                ["Last Verification", sel.lastEntry],
                ["Protocol Status", sel.status.toUpperCase()]
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{k}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: v.includes("GRANTED") ? "#22c55e" : v.includes("DENIED") ? "#ef4444" : "#fff" }}>{v}</span>
                </div>
              ))}
            </div>

            {sel.status === "denied" && (
              <button style={{ width: "100%", marginTop: 20, background: "#3b82f6", border: "none", borderRadius: 10, padding: "12px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 15px rgba(59,130,246,0.3)" }}>Request High-Level Access</button>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
