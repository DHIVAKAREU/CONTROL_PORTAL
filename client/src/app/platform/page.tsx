'use client';

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import axios from "axios";
import { LogOut, LayoutDashboard, Building2, Activity, ShieldCheck, CreditCard, Lock, Settings, Hexagon, ShieldAlert, Plus, Briefcase, Pencil, Mail, EyeOff, Clock, ToggleRight, ToggleLeft, AlertOctagon, ChevronDown, Download } from "lucide-react";

/* ── Mock Data (fallback only) ──────────────────────────────────────────────── */
const ORGS_FALLBACK: any[] = [];

// Platform-level aggregates only — no org-specific data in global view
const PLATFORM = {
  totalOrgs: 5, activeOrgs: 4, totalUsers: 519,
  totalEvents30d: "25.4K", totalRevenueMRR: "$12,480",
  apiUptime: "99.9%", avgLatencyMs: 12, activeSessions: 47,
  criticalAlerts: 1,
};

const AUDIT_LOG = [
  { id: 1, actor: "superior@smartaccess.io", action: "org.suspended",    target: "FinServe Ltd [org_4]",    time: "09:14:22", date: "Today",     severity: "high"   },
  { id: 2, actor: "superior@smartaccess.io", action: "plan.upgraded",    target: "BioLab Research [org_5]", time: "08:55:01", date: "Today",     severity: "info"   },
  { id: 3, actor: "superior@smartaccess.io", action: "org.created",      target: "Acme Corp [org_3]",       time: "16:30:00", date: "Yesterday", severity: "info"   },
  { id: 4, actor: "superior@smartaccess.io", action: "api_key.revoked",  target: "CIT College [org_2]",     time: "11:22:47", date: "Yesterday", severity: "medium" },
  { id: 5, actor: "superior@smartaccess.io", action: "billing.overrode", target: "JUSPAY [org_1]",          time: "09:00:00", date: "Apr 3",     severity: "high"   },
];

const PLAN_COLOR: any = { FREE: "#64748b", STARTER: "#22c55e", PRO: "#0ea5e9", ENTERPRISE: "#a78bfa" };
const SEV_COLOR: any  = { info: "#0ea5e9", medium: "#f59e0b", high: "#ef4444" };

/* ── Tiny components ───────────────────────────────────────── */
function Badge({ children, color = "#0ea5e9" }: any) {
  return <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 4, background: color + "1a", color, border: `1px solid ${color}33` }}>{children}</span>;
}

function Pill({ on, label, onChange, color = "#0ea5e9" }: any) {
  return (
    <div onClick={() => onChange(!on)} style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", userSelect: "none" }}>
      <div style={{ width: 34, height: 19, borderRadius: 10, background: on ? color : "rgba(255,255,255,0.1)", position: "relative", transition: "background .2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 3, left: on ? 17 : 3, width: 13, height: 13, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: on ? color : "rgba(255,255,255,0.4)" }}>{label}</span>
    </div>
  );
}

function StatCard({ label, value, color = "#0ea5e9", sub }: any) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 18px" }}>
      <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>{label}</p>
      <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color, fontFamily: "monospace", letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ margin: "5px 0 0", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{sub}</p>}
    </div>
  );
}

/* ── Privacy Warning Banner ────────────────────────────────── */
function PrivacyBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 12, animation: "fadeIn .3s ease" }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 700, color: "#f59e0b" }}>Superior Admin — Cross-Org Data Access Active</p>
        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
          You are viewing <strong style={{ color: "#fff" }}>platform-level aggregates only.</strong> Individual organisation data (users, zones, access events, credentials) is <strong style={{ color: "#fff" }}>never shown</strong> in this view. To inspect a specific org, use <strong style={{ color: "#fff" }}>Impersonate Org</strong> — all actions are audit-logged.
        </p>
      </div>
      <button onClick={() => setDismissed(true)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 16, padding: 0, flexShrink: 0 }}>✕</button>
    </div>
  );
}

/* ── Impersonate Modal ─────────────────────────────────────── */
function ImpersonateModal({ org, onClose, onConfirm }: any) {
  const [reason, setReason] = useState("");
  const [checked, setChecked] = useState(false);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#0d1524", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 16, padding: "28px 32px", width: 440, animation: "fadeIn .2s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#ef4444" }}>Impersonate Organisation</h2>
        </div>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
          You are about to enter <strong style={{ color: "#fff" }}>{org.name}</strong>'s admin context. All actions you take will be performed in their tenant scope and <strong style={{ color: "#f59e0b" }}>permanently audit-logged</strong> with your identity.
        </p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Reason for access *</label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Customer requested billing support, Investigating access anomaly..."
            rows={3}
            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 13, resize: "none", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <div onClick={() => setChecked(c => !c)} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 22, cursor: "pointer" }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${checked ? "#ef4444" : "rgba(255,255,255,0.2)"}`, background: checked ? "#ef4444" : "transparent", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>
            {checked && <span style={{ fontSize: 10, color: "#fff", fontWeight: 800 }}>✓</span>}
          </div>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>I understand this session is logged and I will only access data necessary for the stated purpose (data minimisation principle).</p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px", color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
          <button
            disabled={!reason.trim() || !checked}
            onClick={() => onConfirm(reason)}
            style={{ flex: 1, background: reason.trim() && checked ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${reason.trim() && checked ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.08)"}`, borderRadius: 8, padding: "10px", color: reason.trim() && checked ? "#ef4444" : "rgba(255,255,255,0.2)", fontSize: 13, fontWeight: 700, cursor: reason.trim() && checked ? "pointer" : "not-allowed", transition: "all .2s" }}>
            Enter Org Context →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Org Form Modal (Add / Edit) ───────────────────────────── */
function OrgFormModal({ org, onClose, onSave }: { org: any | null; onClose: () => void; onSave: (data: any) => void }) {
  const isEdit = !!org;
  const [name, setName] = useState(org?.name ?? "");
  const [domain, setDomain] = useState(org?.domain ?? "");
  const [status, setStatus] = useState(org?.status ?? "ACTIVE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const valid = name.trim().length > 0 && domain.trim().length > 0;

  const handleSubmit = async () => {
    if (!valid) return;
    setLoading(true);
    setError("");
    try {
      await onSave({ name: name.trim(), domain: domain.trim(), status });
    } catch (e: any) {
      setError(e?.message || "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(6px)" }}>
      <div style={{ background: "#0d1524", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 20, padding: "32px", width: 480, animation: "fadeIn .2s ease", boxShadow: "0 25px 60px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6" }}>
            <Pencil size={18} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em" }}>Edit Organization</h2>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Updating {org?.name}</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 24 }}>
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Organization Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Acme Corp" autoFocus style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Domain</label>
            <input value={domain} onChange={e => setDomain(e.target.value)} placeholder="e.g. acme.com" style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit", cursor: "pointer" }}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>
        </div>

        {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 18 }}><p style={{ margin: 0, fontSize: 12, color: "#ef4444" }}>⚠ {error}</p></div>}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} disabled={loading} style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSubmit} disabled={!valid || loading} style={{ flex: 2, background: valid && !loading ? "#3b82f6" : "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.4)", borderRadius: 10, padding: "12px", color: valid && !loading ? "#fff" : "rgba(255,255,255,0.3)", fontSize: 13, fontWeight: 800, cursor: valid && !loading ? "pointer" : "not-allowed" }}>
            {loading ? "Saving…" : "💾 Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Field helper ──────────────────────────────────────────── */
function Field({ label, value, onChange, placeholder, hint, type = "text", autoFocus = false }: any) {
  const filled = value.trim().length > 0;
  return (
    <div>
      <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} autoFocus={autoFocus}
        style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${filled ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit", transition: "border .2s", boxSizing: "border-box" }}
      />
      {hint && <p style={{ margin: "5px 0 0", fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{hint}</p>}
    </div>
  );
}

function pwStrength(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

/* ── New Org Wizard ────────────────────────────────────────── */
function NewOrgWizard({ onClose, onCreated }: { onClose: () => void; onCreated: (org: any, creds: any) => void }) {
  const [step, setStep] = useState(1);
  // Step 1 — Org Details
  const [orgName, setOrgName]     = useState("");
  const [domain, setDomain]       = useState("");
  const [slug, setSlug]           = useState("");
  const [plan, setPlan]           = useState("STARTER");
  // Step 2 — Admin Credentials
  const [adminName, setAdminName]  = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPass, setAdminPass]  = useState("");
  const [showPass, setShowPass]    = useState(false);
  // Step 3 — Result
  const [created, setCreated]      = useState<any>(null);

  const [loading, setLoading]      = useState(false);
  const [error, setError]          = useState("");

  // auto-fill slug from name
  const handleNameChange = (v: string) => {
    setOrgName(v);
    if (!slug) setSlug(v.replace(/\s+/g, "-").toUpperCase().substring(0, 12));
  };
  // auto-fill admin email from domain
  const handleDomainChange = (v: string) => {
    setDomain(v);
    if (!adminEmail) setAdminEmail(`admin@${v}`);
  };

  const step1Valid = orgName.trim().length > 0 && domain.trim().length > 0;
  const strength = pwStrength(adminPass);
  const strengthColor = ["#ef4444","#f59e0b","#f59e0b","#22c55e","#22c55e"][strength];
  const strengthLabel = ["Weak","Fair","Fair","Strong","Very Strong"][strength];

  const handleCreate = async () => {
    setLoading(true);
    setError("");
    try {
      const { useAuthStore: _store } = await import("@/store/useAuthStore");
      const tok = _store.getState().token;
      const res = await (await import("axios")).default.post(
        "/api/superadmin/create-organization",
        { name: orgName.trim(), domain: domain.trim(), slug: slug.trim() || undefined, plan, adminName: adminName.trim() || undefined, adminEmail: adminEmail.trim() || undefined, adminPassword: adminPass || undefined },
        { headers: { Authorization: `Bearer ${tok}` } }
      );
      setCreated(res.data);
      setStep(3);
      onCreated(res.data.organization, res.data.credentials);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e.message || "Creation failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const CopyBtn = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    return (
      <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        style={{ background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)", border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`, borderRadius: 6, padding: "3px 10px", color: copied ? "#22c55e" : "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
        {copied ? "✓ Copied" : "Copy"}
      </button>
    );
  };

  const PLANS = [
    { id: "STARTER",    label: "Starter",    price: "$49/mo",   color: "#22c55e",  desc: "Up to 50 users, 5 zones" },
    { id: "PRO",        label: "Pro",        price: "$199/mo",  color: "#0ea5e9",  desc: "Up to 500 users, 50 zones" },
    { id: "ENTERPRISE", label: "Enterprise", price: "Custom",   color: "#a78bfa",  desc: "Unlimited users & zones" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, backdropFilter: "blur(8px)" }}>
      <div style={{ background: "#0a1020", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 24, width: 560, maxHeight: "90vh", overflow: "auto", animation: "fadeIn .25s ease", boxShadow: "0 40px 80px rgba(0,0,0,0.7)" }}>
        
        {/* Header */}
        <div style={{ padding: "28px 32px 0", borderBottom: step < 3 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
          {step < 3 && (
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(99,102,241,0.15))", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Building2 size={22} color="#3b82f6" />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, letterSpacing: "-0.04em" }}>New Organization</h2>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Step {step} of 2 — {step === 1 ? "Organization Details" : "Admin Account Setup"}</p>
              </div>
              <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 20, padding: 4 }}>✕</button>
            </div>
          )}
          {/* Step Progress */}
          {step < 3 && (
            <div style={{ display: "flex", gap: 6, paddingBottom: 24 }}>
              {[1, 2].map(s => (
                <div key={s} style={{ flex: 1, height: 3, borderRadius: 3, background: s <= step ? "#3b82f6" : "rgba(255,255,255,0.08)", transition: "background .3s" }} />
              ))}
            </div>
          )}
        </div>

        {/* STEP 1 — Org Details */}
        {step === 1 && (
          <div style={{ padding: "28px 32px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <Field label="Organization Name *" value={orgName} onChange={handleNameChange} placeholder="e.g. Acme Corp" autoFocus />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Domain *" value={domain} onChange={handleDomainChange} placeholder="acme.com" hint={`Admin: admin@${domain || "domain.com"}`} />
                <Field label="Slug / Code" value={slug} onChange={setSlug} placeholder="ACME-CORP" hint="Auto-generated identifier" />
              </div>
              {/* Plan Selector */}
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Subscription Plan</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {PLANS.map(p => (
                    <div key={p.id} onClick={() => setPlan(p.id)}
                      style={{ padding: "14px 12px", borderRadius: 12, border: `1px solid ${plan === p.id ? p.color + "66" : "rgba(255,255,255,0.08)"}`, background: plan === p.id ? p.color + "10" : "rgba(255,255,255,0.02)", cursor: "pointer", transition: "all .15s", textAlign: "center" }}>
                      <div style={{ fontSize: 11, fontWeight: 900, color: p.color, marginBottom: 3 }}>{p.label}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{p.price}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", lineHeight: 1.4 }}>{p.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
              <button onClick={onClose} style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "13px", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => setStep(2)} disabled={!step1Valid}
                style={{ flex: 2, background: step1Valid ? "#3b82f6" : "rgba(59,130,246,0.2)", border: "none", borderRadius: 10, padding: "13px", color: step1Valid ? "#fff" : "rgba(255,255,255,0.3)", fontSize: 13, fontWeight: 800, cursor: step1Valid ? "pointer" : "not-allowed", transition: "all .2s" }}>
                Next: Admin Setup →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Admin Credentials */}
        {step === 2 && (
          <div style={{ padding: "28px 32px" }}>
            <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 12, padding: "12px 16px", marginBottom: 22, display: "flex", alignItems: "center", gap: 12 }}>
              <Building2 size={16} color="#3b82f6" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#fff" }}>{orgName}</p>
                <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{domain} · {plan} plan</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <Field label="Admin Full Name" value={adminName} onChange={setAdminName} placeholder={`${orgName} Administrator`} hint="Leave blank to auto-generate" autoFocus />
              <Field label="Admin Email" value={adminEmail} onChange={setAdminEmail} placeholder={`admin@${domain}`} type="email" hint="This will be the login email" />
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Admin Password <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 400 }}>(leave blank to auto-generate)</span></label>
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} value={adminPass} onChange={e => setAdminPass(e.target.value)} placeholder="Min. 8 chars with uppercase + number"
                    style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${adminPass ? strengthColor + "66" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, padding: "12px 44px 12px 14px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                  <button onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 11, padding: 0 }}>
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
                {adminPass.length > 0 && (
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 3, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <div style={{ width: `${(strength / 4) * 100}%`, height: "100%", background: strengthColor, transition: "all .3s" }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: strengthColor, flexShrink: 0 }}>{strengthLabel}</span>
                  </div>
                )}
              </div>
            </div>
            {error && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", marginTop: 18 }}><p style={{ margin: 0, fontSize: 12, color: "#ef4444" }}>⚠ {error}</p></div>}
            <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "13px", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← Back</button>
              <button onClick={handleCreate} disabled={loading}
                style={{ flex: 2, background: loading ? "rgba(59,130,246,0.3)" : "linear-gradient(135deg, #3b82f6, #6366f1)", border: "none", borderRadius: 10, padding: "13px", color: "#fff", fontSize: 13, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {loading ? "Creating…" : "🏢 Create Organization"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Success */}
        {step === 3 && created && (
          <div style={{ padding: "36px 32px" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(34,197,94,0.12)", border: "2px solid rgba(34,197,94,0.4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>✓</div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#22c55e" }}>Organization Created!</h2>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{created.organization?.name} is now live on the platform.</p>
            </div>

            <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "20px 22px", marginBottom: 16 }}>
              <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: "#f59e0b" }}>⚠ Admin Login Credentials — Save These Now</p>
              {[
                { label: "Organization", value: created.organization?.name },
                { label: "Domain", value: created.organization?.domain },
                { label: "Plan", value: created.organization?.plan },
                { label: "Admin Email", value: created.credentials?.adminEmail },
                { label: "Temp Password", value: created.credentials?.tempPassword },
                { label: "Login URL", value: created.credentials?.loginUrl },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", width: 120, flexShrink: 0 }}>{r.label}</span>
                  <span style={{ fontSize: 12, color: "#fff", fontFamily: "monospace", flex: 1 }}>{r.value}</span>
                  <CopyBtn text={r.value || ""} />
                </div>
              ))}
            </div>

            <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 22 }}>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(245,158,11,0.8)", lineHeight: 1.5 }}>The admin will be prompted to change the password on first login. Share credentials securely.</p>
            </div>

            <button onClick={onClose} style={{ width: "100%", background: "#3b82f6", border: "none", borderRadius: 12, padding: "14px", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
              Done — Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


function OrgRow({ org, onImpersonate, onSuspend, redacted }: any) {
  const [hovered, setHovered] = useState(false);
  const isSuspended = org.status === "SUSPENDED";
  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? "rgba(255,255,255,0.02)" : "transparent", borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background .15s" }}
    >
      <td style={{ padding: "13px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${PLAN_COLOR[org.plan]}33, ${PLAN_COLOR[org.plan]}11)`, border: `1px solid ${PLAN_COLOR[org.plan]}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: PLAN_COLOR[org.plan], flexShrink: 0 }}>
            {org.name[0]}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: isSuspended ? "rgba(255,255,255,0.3)" : "#fff" }}>{org.name}</p>
            <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>{org.slug}.smartaccess.io · {org.region}</p>
          </div>
        </div>
      </td>
      <td style={{ padding: "13px 18px" }}><Badge color={PLAN_COLOR[org.plan]}>{org.plan}</Badge></td>
      <td style={{ padding: "13px 18px", fontSize: 13, fontFamily: "monospace", color: "rgba(255,255,255,0.6)" }}>
        {redacted ? <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>●●●</span> : org.users}
      </td>
      <td style={{ padding: "13px 18px", fontSize: 13, fontFamily: "monospace", color: "rgba(255,255,255,0.6)" }}>
        {redacted ? <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>●●●</span> : org.events30d.toLocaleString()}
      </td>
      <td style={{ padding: "13px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: isSuspended ? "#ef4444" : "#22c55e", flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: isSuspended ? "#ef4444" : "#22c55e", fontWeight: 600 }}>{org.status}</span>
        </div>
      </td>
      <td style={{ padding: "13px 18px" }}>
        <div style={{ display: "flex", gap: 7 }}>
          <button
            onClick={() => onImpersonate(org)}
            style={{ background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 6, padding: "5px 11px", color: "#0ea5e9", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
            Impersonate
          </button>
          <button
            onClick={() => onSuspend(org)}
            style={{ background: isSuspended ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${isSuspended ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`, borderRadius: 6, padding: "5px 11px", color: isSuspended ? "#22c55e" : "#ef4444", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
            {isSuspended ? "Restore" : "Suspend"}
          </button>
        </div>
      </td>
    </tr>
  );
}

function PolicyToggle({ title, desc, state, onChange }: any) {
  return (
    <div 
      style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        padding: 16, 
        borderRadius: 14, 
        border: "1px solid", 
        borderColor: state ? "rgba(56,189,248,0.2)" : "rgba(255,255,255,0.05)",
        background: state ? "rgba(56,189,248,0.05)" : "rgba(0,0,0,0.2)",
        transition: "all .2s ease",
        cursor: "pointer"
      }}
      onClick={onChange}
    >
       <div style={{ paddingRight: 20 }}>
          <h4 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.9)" }}>{title}</h4>
          <p style={{ margin: "3px 0 0", fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 500, lineHeight: 1.5 }}>{desc}</p>
       </div>
       <div style={{ flexShrink: 0 }}>
          {state ? (
            <ToggleRight size={30} style={{ color: "#38bdf8", filter: "drop-shadow(0 0 5px rgba(56,189,248,0.3))" }} />
          ) : (
            <ToggleLeft size={30} style={{ color: "rgba(255,255,255,0.15)" }} />
          )}
       </div>
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────────── */
export default function SuperiorAdmin() {
  const [tab, setTab] = useState("overview");
  const [orgs, setOrgs] = useState<any[]>(ORGS_FALLBACK);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [impersonateTarget, setImpersonateTarget] = useState<any>(null);
  const [orgFormTarget, setOrgFormTarget] = useState<any | null>(undefined); // undefined = closed, obj = edit
  const [showNewOrgWizard, setShowNewOrgWizard] = useState(false);
  const [redactMetrics, setRedactMetrics] = useState(false);
  const [showPII, setShowPII] = useState(false);
  const [auditFilter, setAuditFilter] = useState("all");
  const [realAuditLogs, setRealAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [tick, setTick] = useState(0);
  
  // New Privacy States
  const [requireJustification, setRequireJustification] = useState(true);
  const [notifyOrg, setNotifyOrg] = useState(true);
  const [retentionPeriod, setRetentionPeriod] = useState("90_days");
  const [impersonationTimeout, setImpersonationTimeout] = useState("30_mins");

  // System Settings States
  const [platformName, setPlatformName] = useState("Smart Access Platform");
  const [platformDomain, setPlatformDomain] = useState("smartaccess.io");
  const [gatewayUrl, setGatewayUrl] = useState("https://gw.smartaccess.io/v2");
  const [supportEmail, setSupportEmail] = useState("ops@smartaccess.io");
  const [clusterRegion, setClusterRegion] = useState("aws-us-east-1");

  const { user, logout, impersonate, impersonatingFrom, stopImpersonate, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => { const t = setInterval(() => setTick(n => n + 1), 4000); return () => clearInterval(t); }, []);

  // --- FETCH REAL ORGS ---
  const fetchOrgs = async (tok: string) => {
    setOrgsLoading(true);
    try {
      const res = await axios.get('/api/superadmin/list-organizations', {
        headers: { Authorization: `Bearer ${tok}` }
      });
      if (Array.isArray(res.data) && res.data.length > 0) setOrgs(res.data);
    } catch (err: any) {
      const status = err?.response?.status;
      const errCode = err?.response?.data?.error;
      if (status === 403) {
        // If we are impersonating, ignore this 403 as the platform page will soon navigate away
        if (impersonatingFrom) return;

        // Stale token with wrong role — force fresh login
        console.warn('[PLATFORM] 403 on list-organizations — token role mismatch. Current role in token:', errCode, err?.response?.data?.current);
        logout();
        router.push('/login?reason=session_expired');
        return;
      }
      console.error('FAILED_FETCH_ORGS:', err);
    } finally {
      setOrgsLoading(false);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      // Skip if impersonating (the platform page logic shouldn't run with a shadow token)
      if (impersonatingFrom) return;
      
      try {
        const res = await axios.get('/api/superadmin/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) {
          if (res.data.requireJustification !== undefined) setRequireJustification(res.data.requireJustification === true);
          if (res.data.notifyOrg !== undefined) setNotifyOrg(res.data.notifyOrg === true);
          if (res.data.retentionPeriod !== undefined) setRetentionPeriod(res.data.retentionPeriod);
          if (res.data.impersonationTimeout !== undefined) setImpersonationTimeout(res.data.impersonationTimeout);
          if (res.data.redactMetrics !== undefined) setRedactMetrics(res.data.redactMetrics === true);
          if (res.data.maskPII !== undefined) setShowPII(res.data.maskPII === false);
          
          if (res.data.platformName) setPlatformName(res.data.platformName);
          if (res.data.platformDomain) setPlatformDomain(res.data.platformDomain);
          if (res.data.gatewayUrl) setGatewayUrl(res.data.gatewayUrl);
          if (res.data.supportEmail) setSupportEmail(res.data.supportEmail);
          if (res.data.clusterRegion) setClusterRegion(res.data.clusterRegion);
        }
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 403) {
          console.warn('[PLATFORM] 403 on settings — token role mismatch:', err?.response?.data);
          // Don't force logout for settings — it's non-critical, page still works
          return;
        }
        console.error('FAILED_FETCH_SETTINGS:', err);
      }
    };
    const fetchAuditLogs = async () => {
      if (impersonatingFrom || !token) return;
      setAuditLoading(true);
      try {
        const res = await axios.get('/api/superadmin/audit-logs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(res.data)) {
          const mapped = res.data.map(log => ({
            ...log,
            actor: log.actor || 'System',
            severity: log.action.includes('Revoked') || log.action.includes('Delete') ? 'high' : 'info',
            date: new Date(log.created_at || Date.now()).toLocaleDateString(),
            time: new Date(log.created_at || Date.now()).toLocaleTimeString()
          }));
          setRealAuditLogs(mapped);
        }
      } catch (err) {
        console.error('FAILED_FETCH_AUDIT:', err);
      } finally {
        setAuditLoading(false);
      }
    };

    if (token && !impersonatingFrom) {
      fetchSettings();
      fetchOrgs(token);
      fetchAuditLogs();
    }
  }, [token, impersonatingFrom]);

  const updateSetting = async (key: string, value: any) => {
    try {
      await axios.patch('/api/superadmin/settings', 
        { key, value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error(`FAILED_UPDATE_SETTING_${key}:`, err);
    }
  };

  const handleSuspend = (org: any) => {
    setOrgs(prev => prev.map(o => o.id === org.id ? { ...o, status: o.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED" } : o));
  };

  // --- ORG CREATED by wizard ---
  const handleOrgCreated = (newOrg: any) => {
    setOrgs(prev => [{ ...newOrg, numericId: prev.length + 1 }, ...prev]);
    if (token) fetchOrgs(token); // refresh from DB
  };

  // --- EDIT ORG ---
  const handleEditOrg = async (data: { name: string; domain: string; status: string }) => {
    const res = await axios.patch(`/api/superadmin/update-organization/${orgFormTarget.id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const updated = res.data.organization;
    setOrgs(prev => prev.map(o => o.id === updated.id ? { ...o, ...updated } : o));
    setOrgFormTarget(undefined);
  };

  const handleImpersonate = async (reason: string) => {
    if (impersonateTarget) {
      try {
        const res = await axios.post('/api/superadmin/impersonate', 
          { orgId: impersonateTarget.id, reason },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (res.data.token) {
          impersonate(res.data.token);
          router.push("/command");
        }
      } catch (err: any) {
        console.error('IMPERSONATION_REQUEST_FAILED:', err.response?.data || err.message);
        alert('Critical: Impersonation protocol failed. Check console for logs.');
      } finally {
        setImpersonateTarget(null);
      }
    }
  };

  const handleLogout = () => {
    router.push("/logout");
  };

  const NAV = [
    { id: "overview",  icon: LayoutDashboard, label: "OVERVIEW"      },
    { id: "orgs",      icon: Building2,       label: "ORGANISATIONS" },
    { id: "audit",     icon: ShieldCheck,     label: "AUDIT LOG"     },
    { id: "settings",  icon: Settings,        label: "SETTINGS"      },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#060b14", fontFamily: "'Inter', system-ui, sans-serif", color: "#fff" }}>
      <style jsx global>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes pulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius:4px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>


      {/* Sidebar */}
      <aside style={{ width: 256, background: "#040810", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", height: "100vh", flexShrink: 0, paddingTop: 0, boxShadow: "10px 0 30px rgba(0,0,0,0.5)", overflow: "hidden" }}>
        <div style={{ padding: "24px 20px 18px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
          <div className="group cursor-pointer" onClick={() => setTab("overview")}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ 
                position: "relative",
                width: 38, 
                height: 38, 
                borderRadius: 10, 
                background: "linear-gradient(135deg, #0ea5e9, #6366f1)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                boxShadow: "0 0 20px rgba(14, 165, 233, 0.3)"
              }}>
                <Hexagon size={20} color="#fff" fill="rgba(255,255,255,0.1)" strokeWidth={2.5} />
                <div style={{ position: "absolute", width: 6, height: 6, borderRadius: "50%", background: "#fff", boxShadow: "0 0 8px #fff" }} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1 }}>
                  {platformName.split(' ')[0]}<span style={{ color: "#38bdf8" }}>{platformName.split(' ').slice(1).join('')}</span>
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 2, fontStyle: "italic" }}>
                  <span style={{ color: "rgba(255,255,255,0.9)" }}>Superior</span> Admin
                </div>
              </div>
            </div>
          </div>
          {/* Platform status pill */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "6px 14px" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 10px #22c55e", animation: "blink 2s ease-in-out infinite" }} />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase" }}>Platform Online</span>
            <span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.2)", fontWeight: 600 }}>V2.1.0</span>
          </div>
        </div>

        <nav className="no-scrollbar" style={{ padding: "20px 12px", flex: 1, overflowY: "auto" }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 12, border: "none", cursor: "pointer", marginBottom: 6, textAlign: "left", background: tab === n.id ? "rgba(56,189,248,0.08)" : "transparent", color: tab === n.id ? "#38bdf8" : "rgba(255,255,255,0.4)", transition: "all .2s" }}>
              <n.icon size={16} strokeWidth={tab === n.id ? 2.5 : 2} />
              <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase" }}>{n.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ padding: "20px", borderTop: "1px solid rgba(255,255,255,0.03)", background: "rgba(0,0,0,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", background: "rgba(4,8,16,0.3)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", position: "relative" }}>
            <div style={{ width: 34, height: 34, borderRadius: 12, background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#38bdf8" }}>S</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>Superior Admin</p>
              <p style={{ margin: 0, fontSize: 9, color: "#38bdf8", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em" }}>Platform Admin</p>
            </div>
            <button 
              onClick={handleLogout}
              style={{ padding: 8, color: "rgba(255,255,255,0.2)", cursor: "pointer", background: "none", border: "none", transition: "color .2s" }}
              onMouseOver={(e) => e.currentTarget.style.color = "#ef4444"}
              onMouseOut={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.2)"}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", paddingTop: 0 }}>
        <header style={{ padding: "20px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: "rgba(4,8,16,0.4)", backdropFilter: "blur(10px)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em", fontFamily: "monospace" }}>
                {tab === "overview" && "Platform Overview"}
                {tab === "orgs"     && "Organisations"}
                {tab === "audit"    && "Audit Log"}
                {tab === "settings" && "System Configuration"}
              </h1>
              <Badge color="#a78bfa">SUPERIOR ADMIN</Badge>
            </div>
            <p style={{ margin: "3px 0 0", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Platform-scope view · Org-specific data is isolated · All actions logged · {tick}s ago</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {tab === "privacy" && (
              <button style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 16px", fontSize: 11, fontWeight: 800, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all .2s" }} onMouseOver={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"} onMouseOut={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}>
                <Download size={14} /> Export Compliance Report
              </button>
            )}
          </div>
        </header>

        <div style={{ flex: 1, overflow: "auto", padding: "40px 40px" }}>

          {/* ── Overview ─────────────────────────────────── */}
          {tab === "overview" && (
            <div style={{ animation: "fadeIn .2s ease" }}>
              <PrivacyBanner />
          {/* Platform stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 20, marginBottom: 32 }}>
                <StatCard label="Active Orgs"    value={PLATFORM.activeOrgs}      color="#22c55e"  sub={`${PLATFORM.totalOrgs} total`} />
                <StatCard label="Total Users"    value={redactMetrics ? "●●●" : PLATFORM.totalUsers}   color="#0ea5e9"  sub="across all orgs" />
                <StatCard label="Events (30d)"   value={redactMetrics ? "●●●" : PLATFORM.totalEvents30d} color="#a78bfa" />
                <StatCard label="MRR"            value={redactMetrics ? "●●●" : PLATFORM.totalRevenueMRR} color="#f59e0b" sub="Stripe live" />
                <StatCard label="API Uptime"     value={PLATFORM.apiUptime}       color="#22c55e"  sub={`${PLATFORM.avgLatencyMs}ms avg`} />
              </div>

              {/* Org health overview — aggregates only */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 0, overflow: "hidden", marginBottom: 20 }}>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>Organisation Health</p>
                    <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 6, padding: "2px 8px" }}>
                      <span style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700 }}>Aggregated · No user data shown</span>
                    </div>
                  </div>
                  <button onClick={() => setTab("orgs")} style={{ background: "none", border: "none", color: "#a78bfa", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Manage Orgs →</button>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {["Organisation","Plan","Users","Events/30d","Status"].map(h => (
                      <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {orgs.map(org => (
                      <tr key={org.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "11px 18px", fontSize: 13, fontWeight: 600 }}>{org.name}</td>
                        <td style={{ padding: "11px 18px" }}><Badge color={PLAN_COLOR[org.plan]}>{org.plan}</Badge></td>
                        <td style={{ padding: "11px 18px", fontSize: 13, fontFamily: "monospace", color: "rgba(255,255,255,0.5)" }}>{redactMetrics ? "●●" : (org.users ?? "—")}</td>
                        <td style={{ padding: "11px 18px", fontSize: 13, fontFamily: "monospace", color: "rgba(255,255,255,0.5)" }}>{redactMetrics ? "●●●" : (org.events30d != null ? org.events30d.toLocaleString() : "—")}</td>
                        <td style={{ padding: "11px 18px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: org.status === "SUSPENDED" ? "#ef4444" : "#22c55e" }} />
                            <span style={{ fontSize: 11, color: org.status === "SUSPENDED" ? "#ef4444" : "#22c55e", fontWeight: 600 }}>{org.status}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Recent audit summary */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>Recent Admin Actions</p>
                  <button onClick={() => setTab("audit")} style={{ background: "none", border: "none", color: "#a78bfa", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>View All →</button>
                </div>
                {realAuditLogs.slice(0, 3).map((e, i) => (
                  <div key={e.id} style={{ padding: "12px 18px", borderBottom: i < 2 && i < realAuditLogs.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: SEV_COLOR[e.severity] + "15", border: `1px solid ${SEV_COLOR[e.severity]}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: SEV_COLOR[e.severity], flexShrink: 0 }}>
                      {e.severity === "high" ? "!" : e.severity === "medium" ? "~" : "i"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <code style={{ fontSize: 12, color: "#a78bfa", background: "rgba(167,139,250,0.08)", padding: "1px 7px", borderRadius: 4 }}>{e.action}</code>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{e.target}</span>
                      </div>
                      <p style={{ margin: "2px 0 0", fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{e.date} · {e.time}</p>
                    </div>
                  </div>
                ))}
                {realAuditLogs.length === 0 && <p style={{ padding: 18, fontSize: 11, color: "rgba(255,255,255,0.2)" }}>No recent activity.</p>}
              </div>
            </div>
          )}

          {/* ── Organisations ─────────────────────────── */}
          {tab === "orgs" && (
            <div style={{ animation: "fadeIn .3s ease-out" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: "-0.04em" }}>Organizations</h2>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Manage multi-tenancy organizations.</p>
                </div>
                <button
                  onClick={() => setShowNewOrgWizard(true)}
                  style={{ 
                    background: "#3b82f6", 
                    color: "#fff", 
                    border: "none", 
                    borderRadius: 8, 
                    padding: "10px 20px", 
                    fontSize: 12, 
                    fontWeight: 800, 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 8, 
                    cursor: "pointer",
                    transition: "all .2s"
                  }} onMouseOver={e => e.currentTarget.style.background = "#2563eb"} onMouseOut={e => e.currentTarget.style.background = "#3b82f6"}>
                  <Plus size={16} strokeWidth={3} />
                  New Organization
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
                {orgs.map(org => (
                  <div key={org.id} style={{ 
                    background: "rgba(255,255,255,0.03)", 
                    border: "1px solid rgba(255,255,255,0.06)", 
                    borderRadius: 16, 
                    padding: 24,
                    transition: "all .3s ease",
                    position: "relative"
                  }} className="group hover:border-[#3b82f644] hover:bg-[rgba(59,130,246,0.03)] focus-within:border-[#3b82f6]">
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(59,130,246,0.2)" }}>
                        <Briefcase size={22} className="text-blue-400" />
                      </div>
                      <button
                        onClick={() => setOrgFormTarget(org)}
                        title="Edit organization"
                        style={{ padding: 8, color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer", borderRadius: 6, transition: "all .15s" }}
                        onMouseOver={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                        onMouseOut={e => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "none"; }}
                      >
                        <Pencil size={14} />
                      </button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>{org.name}</h3>
                      <div style={{ background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.4)" }}>#{org.numericId}</div>
                      <div style={{ 
                        background: org.status === "ACTIVE" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", 
                        color: org.status === "ACTIVE" ? "#22c55e" : "#ef4444",
                        padding: "2px 8px", 
                        borderRadius: 6, 
                        fontSize: 9, 
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}>{org.status}</div>
                    </div>

                    <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, border: "1px solid rgba(255,255,255,0.03)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em" }}>
                        <span style={{ color: "rgba(255,255,255,0.2)" }}>#</span> {org.slug}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "0 4px" }}>
                      <Mail size={14} className="text-slate-500" />
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{org.email}</span>
                    </div>

                    {org.apiKey && (
                      <div style={{ marginBottom: 20, padding: "0 4px" }}>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>API KEY</div>
                        <code style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>{org.apiKey}</code>
                      </div>
                    )}

                    <button 
                      onClick={() => setImpersonateTarget(org)}
                      style={{ 
                        width: "100%", 
                        padding: "12px", 
                        background: "rgba(0,0,0,0.4)", 
                        border: "1px solid rgba(255,255,255,0.08)", 
                        borderRadius: 10, 
                        color: "rgba(255,255,255,0.6)", 
                        fontSize: 10, 
                        fontWeight: 900, 
                        textTransform: "uppercase", 
                        letterSpacing: "0.15em",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        cursor: "pointer",
                        transition: "all .2s"
                      }}
                      className="hover:border-white hover:text-white"
                    >
                      <Settings size={14} />
                      Manage Resources
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Audit Log ────────────────────────────── */}
          {tab === "audit" && (
            <div style={{ animation: "fadeIn .2s ease" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {["all","high","medium","info"].map(f => (
                  <button key={f} onClick={() => setAuditFilter(f)} style={{ background: auditFilter === f ? "rgba(167,139,250,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${auditFilter === f ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 7, padding: "6px 14px", color: auditFilter === f ? "#a78bfa" : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: auditFilter === f ? 700 : 400, cursor: "pointer", textTransform: "capitalize" }}>{f}</button>
                ))}
                <div style={{ marginLeft: "auto", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 7, padding: "6px 14px" }}>
                  <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 600 }}>Immutable log · Cannot be deleted</span>
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
                {auditLoading && <p style={{ padding: 20, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Syncing operational ledger...</p>}
                {!auditLoading && realAuditLogs.length === 0 && <p style={{ padding: 20, fontSize: 13, color: "rgba(255,255,255,0.3)" }}>No audit records found.</p>}
                {(auditFilter === "all" ? realAuditLogs : realAuditLogs.filter(e => e.severity === auditFilter)).map((e, i, arr) => (
                  <div key={e.id} style={{ padding: "14px 18px", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: SEV_COLOR[e.severity] + "15", border: `1px solid ${SEV_COLOR[e.severity]}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: SEV_COLOR[e.severity], flexShrink: 0 }}>
                      {e.severity === "high" ? "!" : e.severity === "medium" ? "~" : "·"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <code style={{ fontSize: 12, color: "#a78bfa", background: "rgba(167,139,250,0.08)", padding: "2px 8px", borderRadius: 5 }}>{e.action}</code>
                        <Badge color={SEV_COLOR[e.severity]}>{e.severity}</Badge>
                      </div>
                      <p style={{ margin: "0 0 2px", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                        Target: <strong style={{ color: "#fff" }}>{e.target}</strong>
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                        Actor: {showPII ? e.actor : e.actor.replace(/(.{3}).*@/, "$1●●●@")} · {e.date} {e.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* ── System Settings ────────────────────────── */}
          {tab === "settings" && (
            <div style={{ maxWidth: 800, animation: "fadeIn .3s ease" }}>
              
              {/* Identity Module */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 24, marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <Hexagon size={18} style={{ color: "rgba(255,255,255,0.4)" }} />
                  <h2 style={{ margin: 0, fontSize: 11, fontWeight: 900, letterSpacing: "0.15em", color: "rgba(255,255,255,0.8)", textTransform: "uppercase" }}>Platform Identity</h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em", marginBottom: 8, textTransform: "uppercase" }}>Global Platform Name</label>
                    <input 
                      value={platformName}
                      onChange={e => { setPlatformName(e.target.value); updateSetting('platformName', e.target.value); }}
                      style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 13, fontWeight: 600, outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em", marginBottom: 8, textTransform: "uppercase" }}>Primary Root Domain</label>
                    <input 
                      value={platformDomain}
                      onChange={e => { setPlatformDomain(e.target.value); updateSetting('platformDomain', e.target.value); }}
                      style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 13, fontWeight: 600, outline: "none" }}
                    />
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div style={{ background: "rgba(239,68,68,0.03)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 20, padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <AlertOctagon size={18} style={{ color: "#ef4444" }} />
                  <h2 style={{ margin: 0, fontSize: 11, fontWeight: 900, letterSpacing: "0.15em", color: "#ef4444", textTransform: "uppercase" }}>Danger Zone</h2>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.04)", padding: "16px 20px", borderRadius: 14 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#fff" }}>Factory Reset Platform</h4>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Permanently delete all organizations, logs, and users. This action is irreversible.</p>
                  </div>
                  <button 
                    onClick={() => { if(confirm("CRITICAL: This will wipe the entire platform. Proceed?")) alert("Environment Purged."); }}
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 8, padding: "8px 16px", color: "#ef4444", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer" }}
                  >
                    Delete Platform Node
                  </button>
                </div>
              </div>

            </div>
          )}


        </div>
      </div>

      {/* Impersonate modal */}
      {impersonateTarget && (
        <ImpersonateModal org={impersonateTarget} onClose={() => setImpersonateTarget(null)} onConfirm={handleImpersonate} />
      )}

      {/* New Org Wizard */}
      {showNewOrgWizard && (
        <NewOrgWizard
          onClose={() => setShowNewOrgWizard(false)}
          onCreated={(org) => handleOrgCreated(org)}
        />
      )}

      {/* Edit Org Modal */}
      {orgFormTarget !== undefined && orgFormTarget !== null && (
        <OrgFormModal
          org={orgFormTarget}
          onClose={() => setOrgFormTarget(undefined)}
          onSave={handleEditOrg}
        />
      )}
    </div>
  );
}
