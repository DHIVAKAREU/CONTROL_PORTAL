import React, { useState, useEffect } from 'react';
import { 
  User, Bell, CheckCircle2,
  Phone, Mail, ShieldAlert, Zap, Users, Globe
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function AdminSettings({ user }: any) {
  const { updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: "+1 (555) 000-0000",
    bio: "Tell us about your role..."
  });

  // Notification States
  const [notifConfig, setNotifConfig] = useState({
    critical: true,
    denied: true,
    provisioning: false,
    sync: true,
    email: true,
    push: true
  });

  const handleSave = () => {
    setSaveStatus('saving');
    
    // Simulate API delay
    setTimeout(() => {
      // Functional Save: Update the global auth store
      updateUser({
        name: formData.name,
      });
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1200);
  };

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: <User size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
  ];

  return (
    <div style={{ animation: "fadeUp .4s ease-out", padding: "40px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
      {/* Header HUD */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "32px", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff" }}>Settings</h1>
          <p style={{ margin: "4px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>Manage your account preferences and system configurations.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saveStatus !== 'idle'}
          style={{ 
            background: saveStatus === 'saved' ? "#10b981" : "#3b82f6", 
            border: "none", 
            borderRadius: "12px", 
            padding: "12px 24px", 
            color: "#fff", 
            fontSize: "13px", 
            fontWeight: 800, 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            cursor: saveStatus === 'idle' ? "pointer" : "default",
            boxShadow: `0 8px 20px ${saveStatus === 'saved' ? "rgba(16,185,129,0.3)" : "rgba(59,130,246,0.3)"}`,
            transition: "all .3s"
          }}
        >
          {saveStatus === 'saving' ? (
            <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
          ) : <CheckCircle2 size={16} />}
          {saveStatus === 'saving' ? "Synchronizing..." : saveStatus === 'saved' ? "Changes Persisted" : "Save Changes"}
        </button>
      </header>

      {/* Navigation Strip */}
      <nav style={{ display: "flex", gap: "8px", background: "rgba(255,255,255,0.02)", padding: "6px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "40px" }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "12px 16px",
              border: "none",
              borderRadius: "12px",
              background: activeTab === t.id ? "rgba(59,130,246,0.12)" : "transparent",
              color: activeTab === t.id ? "#3b82f6" : "rgba(255,255,255,0.4)",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all .2s"
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </nav>

      {activeTab === 'profile' && (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px", animation: "fadeUp .3s ease-out" }}>
          <section style={{ display: "flex", alignItems: "center", gap: "24px", paddingBottom: "32px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ width: "84px", height: "84px", borderRadius: "20px", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: 900, color: "#fff", boxShadow: "0 10px 30px rgba(59,130,246,0.3)" }}>
              {user?.name?.[0] || 'A'}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#fff" }}>{user?.name || 'CIT Admin'}</h2>
              <p style={{ margin: "2px 0 12px", fontSize: "14px", color: "rgba(255,255,255,0.35)" }}>{user?.email || 'admin@cit.edu'}</p>
              <div style={{ display: "flex", gap: "8px" }}>
               <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 10px", borderRadius: "6px", background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)" }}>ADMIN</span>
               <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 10px", borderRadius: "6px", background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>IT DEPARTMENT</span>
              </div>
            </div>
          </section>

          <form style={{ display: "flex", flexDirection: "column", gap: "24px" }} onSubmit={(e) => e.preventDefault()}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <Field label="FULL NAME" icon={<User size={14} />} value={formData.name} onChange={(val: string) => setFormData(p => ({ ...p, name: val }))} />
              <Field label="EMAIL ADDRESS" icon={<Mail size={14} />} value={user?.email || 'admin@cit.edu'} disabled />
            </div>
            <Field label="PHONE NUMBER" icon={<Phone size={14} />} value={formData.phone} onChange={(val: string) => setFormData(p => ({ ...p, phone: val }))} />
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>BIO</label>
              <textarea 
                value={formData.bio} 
                onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
                rows={4} 
                style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "16px", color: "#fff", fontSize: "14px", resize: "none", outline: "none" }} 
              />
            </div>
          </form>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px", animation: "fadeUp .3s ease-out" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>Event Notifications</h2>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "24px" }}>Configure which operational events trigger real-time system alerts.</p>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <NotifCard 
                icon={<ShieldAlert size={18} color="#ef4444" />} 
                title="Critical Alerts" 
                desc="Hardware failure, tamper events, or emergency lockdown triggers."
                on={notifConfig.critical}
                toggle={() => setNotifConfig(prev => ({ ...prev, critical: !prev.critical }))}
              />
              <NotifCard 
                icon={<Zap size={18} color="#f59e0b" />} 
                title="Access Denied" 
                desc="Instant notification when personnel are blocked at high-clearance zones."
                on={notifConfig.denied}
                toggle={() => setNotifConfig(prev => ({ ...prev, denied: !prev.denied }))}
              />
              <NotifCard 
                icon={<Users size={18} color="#3b82f6" />} 
                title="Personnel Provisioning" 
                desc="Alert when new identity credentials or RFID tags are issued."
                on={notifConfig.provisioning}
                toggle={() => setNotifConfig(prev => ({ ...prev, provisioning: !prev.provisioning }))}
              />
              <NotifCard 
                icon={<Globe size={18} color="#10b981" />} 
                title="Network Sync" 
                desc="Status updates on MQTT broker connectivity and node synchronization."
                on={notifConfig.sync}
                toggle={() => setNotifConfig(prev => ({ ...prev, sync: !prev.sync }))}
              />
            </div>
          </div>

          <div style={{ paddingTop: "32px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>Delivery Channels</h2>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "24px" }}>Configure how alerts are delivered to your administrative workstation.</p>
            
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <ChannelRow title="Email Dispatch" desc="Send automated reports and critical summaries to admin@cit.edu" on={notifConfig.email} toggle={() => setNotifConfig(prev => ({ ...prev, email: !prev.email }))} />
              <ChannelRow title="Push Notifications" desc="Real-time browser-level alerts displayed on your mission control dashboard" on={notifConfig.push} toggle={() => setNotifConfig(prev => ({ ...prev, push: !prev.push }))} />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin { from {transform: rotate(0deg)} to {transform: rotate(360deg)} }
        @keyframes fadeUp { from {opacity: 0; transform: translateY(12px)} to {opacity: 1; transform: translateY(0)} }
      `}</style>
    </div>
  );
}

function NotifCard({ icon, title, desc, on, toggle }: any) {
  return (
    <div 
      onClick={toggle}
      style={{ 
        background: on ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)", 
        border: `1px solid ${on ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)"}`, 
        borderRadius: "18px", 
        padding: "20px", 
        cursor: "pointer", 
        transition: "all .2s" ,
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
        <Toggle on={on} />
      </div>
      <div>
        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: on ? "#fff" : "rgba(255,255,255,0.4)" }}>{title}</h4>
        <p style={{ margin: "4px 0 0", fontSize: "11px", color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>{desc}</p>
      </div>
    </div>
  );
}

function ChannelRow({ title, desc, on, toggle }: any) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#fff" }}>{title}</h4>
        <p style={{ margin: "2px 0 0", fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{desc}</p>
      </div>
      <Toggle on={on} onChange={toggle} />
    </div>
  );
}

function Toggle({ on, onChange }: any) {
  return (
    <div 
      onClick={onChange}
      style={{ 
        width: "36px", 
        height: "20px", 
        borderRadius: "10px", 
        background: on ? "#3b82f6" : "rgba(255,255,255,0.1)", 
        position: "relative", 
        cursor: "pointer", 
        transition: "background .2s" 
      }}>
      <div style={{ 
        position: "absolute", 
        top: "3px", 
        left: on ? "19px" : "3px", 
        width: "14px", 
        height: "14px", 
        background: "#fff", 
        borderRadius: "50%", 
        transition: "left .2s cubic-bezier(0.4, 0, 0.2, 1)" 
      }} />
    </div>
  );
}

function Field({ label, value, icon, disabled, onChange }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label style={{ fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>{label}</label>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", left: "16px", color: "rgba(255,255,255,0.2)" }}>{icon}</div>
        <input 
          type="text" 
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          style={{ 
            width: "100%", 
            background: disabled ? "transparent" : "rgba(255,255,255,0.02)", 
            border: "1px solid rgba(255,255,255,0.08)", 
            borderRadius: "14px", 
            padding: "14px 16px 14px 42px", 
            color: disabled ? "rgba(255,255,255,0.3)" : "#fff", 
            fontSize: "14px", 
            outline: "none",
            cursor: disabled ? "not-allowed" : "text",
            transition: "all .2s"
          }}
        />
      </div>
    </div>
  );
}
