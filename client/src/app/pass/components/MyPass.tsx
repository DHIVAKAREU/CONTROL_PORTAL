import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, Badge, SLabel } from './Shared';

export default function MyPass({ user }: any) {
  const [copied, setCopied] = useState(false);
  const copy = () => { setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <div style={{ animation: "fadeUp .25s ease", display: "flex", justifyContent: "center" }}>
      <div style={{ width: 340, display: "flex", flexDirection: "column", gap: 12 }}>
        <Card style={{ padding: "24px 20px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 65%)", pointerEvents: "none" }} />
          <p style={{ margin: "0 0 4px", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#3b82f6" }}>Authorized Identity</p>
          <p style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em" }}>{user?.org || 'Platform Nexus'}</p>

          <div style={{ display: "inline-block", borderRadius: 14, overflow: "hidden", border: "2px solid rgba(59,130,246,0.25)", boxShadow: "0 0 30px rgba(59,130,246,0.15)", background: "#fff", position: "relative" }}>
               <div style={{ padding: 4, background: "#fff", border: "12px solid #fff" }}>
                 <QRCodeSVG 
                   value={`sacp:auth/${user?.id || 'guest'}:${user?.org || 'cit'}`}
                   size={160}
                   level="H"
                   includeMargin={false}
                 />
               </div>
          </div>

          <p style={{ margin: "16px 0 6px", fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>{user?.name}</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
            <Badge>{user?.role}</Badge>
            <Badge color="#a78bfa">Lvl {user?.clearanceLevel} Access</Badge>
          </div>

          <div onClick={() => copy()} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 14px", cursor: "pointer", marginBottom: 14 }}>
            <code style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "monospace", letterSpacing: "0.05em" }}>ID: #{user?.id?.toString().slice(0, 8).toUpperCase()}</code>
            <span style={{ fontSize: 11, color: copied ? "#22c55e" : "rgba(255,255,255,0.3)" }}>{copied ? "✓ Copied" : "Copy"}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "7px 12px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "blink 2s ease-in-out infinite" }} />
            <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 700, letterSpacing: "0.06em" }}>PASS ACTIVE · IDENTITY VERIFIED</span>
          </div>
        </Card>

        <Card style={{ padding: "14px 16px" }}>
          <SLabel>Pass validity</SLabel>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Issued</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>Jan 12, 2025</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Expires</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>May 7, 2026</span>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2, marginTop: 10 }}>
            <div style={{ height: "100%", width: "78%", background: "linear-gradient(to right,#3b82f6,#22c55e)", borderRadius: 2 }} />
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 10, color: "rgba(255,255,255,0.3)", textAlign: "right" }}>30 days remaining</p>
        </Card>
      </div>
    </div>
  );
}
