import React, { useState } from 'react';
import { Card, Badge, SLabel } from './Shared';

export default function Profile({ user }: any) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [dept, setDept] = useState(user?.role || 'Computer Science');

  return (
    <div style={{ animation: "fadeUp .25s ease" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg,#3b82f6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, flexShrink: 0 }}>
              {user?.name?.[0]}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{name}</p>
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                <Badge>{user?.role}</Badge>
                <Badge color="#a78bfa">Clearance {user?.clearanceLevel}</Badge>
              </div>
            </div>
          </div>

          <SLabel>Personnel info</SLabel>
          {editing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)" }}>Full name</p>
                <input value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(59,130,246,0.35)", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 13, outline: "none" }} />
              </div>
              <div>
                <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)" }}>Department</p>
                <input value={dept} onChange={e => setDept(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(59,130,246,0.35)", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 13, outline: "none" }} />
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button onClick={() => setEditing(false)} style={{ flex: 1, background: "#3b82f6", border: "none", borderRadius: 8, padding: "9px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save</button>
                <button onClick={() => setEditing(false)} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px", color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              {[
                ["Full name", name], ["Email", user?.email], ["Department", dept], ["Organisation", user?.org || 'Platform'], ["Sync Node", "SA-CORE-01"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{k}</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
              <button onClick={() => setEditing(true)} style={{ marginTop: 14, width: "100%", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 8, padding: "9px", color: "#3b82f6", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Edit profile</button>
            </>
          )}
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card style={{ padding: "18px 20px" }}>
            <SLabel>System identifiers</SLabel>
            {[
              ["System ID", user?.id?.toString().toUpperCase(), true],
              ["Tenant ref", user?.tenantId?.toString().toUpperCase() || 'GLOBAL', true],
              ["Access tier", "PRO_ENTERPRISE", false],
              ["Sync logic", "Encrypted", false],
            ].map(([k, v, mono]: any) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{k}</span>
                <code style={{ fontSize: 10, color: mono ? "rgba(59,130,246,0.8)" : "rgba(255,255,255,0.7)", fontFamily: mono ? "monospace" : "inherit", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</code>
              </div>
            ))}
          </Card>

          <Card style={{ padding: "16px 18px" }}>
            <SLabel>Access statistics</SLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { label: "Total events", value: "248", color: "#3b82f6" },
                { label: "Granted", value: "241", color: "#22c55e" },
                { label: "Denied", value: "7", color: "#ef4444" },
                { label: "Zones access", value: "5", color: "#a78bfa" },
                { label: "This month", value: "34", color: "#f59e0b" },
                { label: "Grant rate", value: "97.2%", color: "#22c55e" },
              ].map(s => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px", textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: s.color, fontFamily: "monospace" }}>{s.value}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
