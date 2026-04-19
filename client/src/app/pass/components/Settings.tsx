import React, { useState } from 'react';
import { Card, SLabel, Toggle } from './Shared';
import { SESSIONS } from './mockData';

export default function Settings({ user }: any) {
  const [twofa, setTwofa] = useState(true);
  const [biometric, setBio] = useState(true);
  const [emailNotif, setEmail] = useState(true);

  return (
    <div style={{ animation: "fadeUp .25s ease", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Card style={{ padding: "20px" }}>
        <SLabel>Security & authentication</SLabel>
        {[
          { label: "Two-Factor Auth (2FA)", state: twofa, set: setTwofa },
          { label: "Biometric unlock", state: biometric, set: setBio },
        ].map(s => (
          <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</span>
            <Toggle on={s.state} onChange={s.set} />
          </div>
        ))}
      </Card>
      <Card style={{ padding: "18px 20px" }}>
        <SLabel>Notifications</SLabel>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0" }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Email alerts</span>
          <Toggle on={emailNotif} onChange={setEmail} />
        </div>
      </Card>
      <Card style={{ padding: "18px 20px" }}>
        <SLabel>Active Sessions</SLabel>
        {SESSIONS.map(s => (
          <div key={s.id} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", alignItems: "center" }}>
            <span style={{ fontSize: 20 }}>{s.device.includes("iPhone") ? "📱" : "💻"}</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700 }}>{s.device}</p>
              <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{s.loc} · {s.time}</p>
            </div>
            {!s.current && <button style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, padding: "4px 10px", color: "#ef4444", fontSize: 10, fontWeight: 700 }}>Revoke</button>}
          </div>
        ))}
      </Card>
    </div>
  );
}
