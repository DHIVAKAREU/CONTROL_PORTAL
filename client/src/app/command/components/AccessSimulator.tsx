import React, { useState, useEffect } from 'react';
import { 
  Smartphone, User as UserIcon, MapPin, Wifi, XCircle, CheckCircle2, 
  ChevronDown, ShieldAlert, Clock, Scan
} from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

interface AccessSimulatorProps {
  users: any[];
}

export default function AccessSimulator({ users }: AccessSimulatorProps) {
  const { token, logout } = useAuthStore();
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [status, setStatus] = useState<'IDLE' | 'SCANNING' | 'DENIED' | 'GRANTED'>('IDLE');
  const [currentTime, setCurrentTime] = useState('');
  const [denialReason, setDenialReason] = useState<string | null>(null);
  const [zones, setZones] = useState<any[]>([]);
  const fetchDataRef = React.useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const zRes = await axios.get('/api/zones', config);
        setZones(zRes.data);
      } catch (err: any) {
        console.error("Failed to load simulator data:", err);
        if (err.response?.status === 401) {
          logout();
        }
      }
    };
    if (token) fetchData();
  }, [token, logout]);

  // Sync clock for mock terminal
  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const handleScan = async () => {
    if (!selectedProfile || !selectedPoint) {
      setStatus('DENIED');
      setDenialReason('NO_IDENTITY_SELECTED');
      return;
    }

    setStatus('SCANNING');
    setDenialReason(null);

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post('/api/permissions/simulate', {
        userId: selectedProfile.id,
        zoneId: selectedPoint.id
      }, config);

      setTimeout(() => {
        if (res.data.status === 'GRANTED') {
          setStatus('GRANTED');
        } else {
          setStatus('DENIED');
          setDenialReason(res.data.reason || 'UNAUTHORIZED_ACCESS');
        }
      }, 800);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setDenialReason('SESSION_EXPIRED_PLEASE_RELOGIN');
      } else {
        setDenialReason('COMMUNICATION_ERROR');
      }
      setStatus('DENIED');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: <UserIcon size={16} /> },
  ];

  return (
    <div style={{ padding: "40px", maxWidth: "1250px", margin: "0 auto", width: "100%", display: "flex", gap: "40px", animation: "fadeUp .4s ease-out" }}>
      
      {/* Left Configuration Panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "28px" }}>
          
          <header style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div style={{ color: "#3b82f6" }}><Smartphone size={20} /></div>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#fff" }}>Configure Digital Key</h2>
          </header>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "10px", fontWeight: 800, color: "#3b82f6", letterSpacing: "0.1em" }}>IDENTITY PROFILE</label>
            <HUDSelect 
              value={selectedProfile ? selectedProfile.name : '-- Select Identity Profile --'} 
              icon={<UserIcon size={14} />} 
              options={users}
              onSelect={setSelectedProfile}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "10px", fontWeight: 800, color: "#3b82f6", letterSpacing: "0.1em" }}>TARGET ACCESS POINT</label>
            <HUDSelect 
              value={selectedPoint ? selectedPoint.name : '-- Select Access Point --'} 
              icon={<MapPin size={14} />} 
              options={zones}
              onSelect={setSelectedPoint}
            />
          </div>

          {/* Tactical Digital Card Preview */}
          <div style={{ 
            background: "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(30,58,138,0.05) 100%)", 
            border: "1px solid rgba(59,130,246,0.3)", 
            borderRadius: "24px", 
            padding: "24px", 
            display: "flex", 
            flexDirection: "column", 
            gap: "20px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                   <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6" }}><Wifi size={16} /></div>
                   <span style={{ fontSize: "10px", fontWeight: 900, color: "#3b82f6", letterSpacing: "0.1em" }}>NFC BROADCAST</span>
                </div>
                <div style={{ textAlign: "right", opacity: 0.8 }}>
                   <p style={{ margin: 0, fontSize: "9px", fontWeight: 900, color: "#fff", letterSpacing: "0.05em" }}>SECURE PASS</p>
                </div>
             </div>
 
             <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: "#0d131f", border: "2px solid #3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 900, color: "#3b82f6", boxShadow: "0 0 20px rgba(59,130,246,0.2)" }}>
                   {selectedProfile ? selectedProfile.name[0] : '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                   <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 950, color: "#fff", letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{selectedProfile ? selectedProfile.name : 'Awaiting Selection'}</h3>
                   <p style={{ margin: "4px 0 0", fontSize: "11px", fontWeight: 900, color: !selectedProfile ? "rgba(255,255,255,0.2)" : "rgba(34,197,94,0.8)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{!selectedProfile ? 'SELECT OPERATIVE' : `${selectedProfile.dept} DIVISION`}</p>
                </div>
             </div>
 
             {selectedProfile && (
               <div style={{ paddingTop: "16px", borderTop: "1px solid rgba(59,130,246,0.2)", fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", letterSpacing: "0.05em" }}>
                 HEX_ID: {selectedProfile.id.substring(0, 18).toUpperCase()}...
               </div>
             )}
          </div>
        </div>

        <button 
          onClick={handleScan}
          disabled={status === 'SCANNING'}
          style={{ 
            width: "100%", 
            background: "#3b82f6", 
            border: "none", 
            borderRadius: "16px", 
            padding: "18px", 
            color: "#fff", 
            fontSize: "15px", 
            fontWeight: 800, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            gap: "12px",
            cursor: "pointer",
            boxShadow: "0 10px 25px rgba(59,130,246,0.3)",
            transition: "all .3s"
          }}>
          {status === 'SCANNING' ? (
            <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
          ) : <Wifi size={18} />}
          {status === 'SCANNING' ? 'Processing Scan...' : 'Tap to Scan Card'}
        </button>
      </div>

      {/* Right Simulator Display Case */}
      <div style={{ flex: 1.2, position: "relative" }}>
        {/* Device Frame */}
        <div style={{ 
          width: "100%", 
          height: "100%", 
          background: "#080b14", 
          borderRadius: "48px", 
          padding: "24px", 
          border: "8px solid #1a1e2a",
          boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column"
        }}>
          {/* Inner Screen */}
          <div style={{ 
            flex: 1, 
            background: "#02040a", 
            borderRadius: "32px", 
            padding: "40px", 
            display: "flex", 
            flexDirection: "column", 
            overflow: "hidden",
            position: "relative"
          }}>
            {/* Guard Override Header */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "60px" }}>
              <div style={{ textAlign: "center", opacity: 0.6 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#fff", marginBottom: "4px" }}>
                   <ShieldAlert size={14} />
                   <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>Guard Override Active</span>
                </div>
                <p style={{ margin: 0, fontSize: "9px", color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>(Swipe Right to Allow, Left to Deny)</p>
              </div>
            </div>

            {/* Status Visualizer */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              {status === 'IDLE' && (
                <div style={{ animation: "pulse 2s infinite" }}>
                   <div style={{ width: "96px", height: "96px", borderRadius: "50%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
                      <Wifi size={40} color="rgba(255,255,255,0.2)" />
                   </div>
                   <h2 style={{ fontSize: "28px", fontWeight: 900, color: "rgba(255,255,255,0.15)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Awaiting Scan</h2>
                </div>
              )}

              {status === 'SCANNING' && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                   <div style={{ width: "80px", height: "80px", border: "4px solid rgba(59,130,246,0.1)", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "32px" }} />
                   <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.1em" }}>Authenticating...</h2>
                </div>
              )}

              {status === 'DENIED' && (
                <div style={{ animation: "shake 0.4s ease-in-out" }}>
                   <div style={{ width: "120px", height: "120px", borderRadius: "50%", background: "rgba(239,68,68,0.1)", border: "2px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "32px", marginLeft: "auto", marginRight: "auto" }}>
                      <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 0 40px rgba(239,68,68,0.4)" }}>
                        <XCircle size={48} />
                      </div>
                   </div>
                   <h2 style={{ fontSize: "42px", fontWeight: 900, color: "#ef4444", textTransform: "uppercase", letterSpacing: "-0.02em", margin: 0 }}>Access Denied</h2>
                   <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.4)", fontWeight: 600, marginTop: "8px" }}>{denialReason || 'System Error'}</p>
                </div>
              )}

              {status === 'GRANTED' && (
                <div style={{ animation: "fadeUp .5s ease-out" }}>
                   <div style={{ width: "120px", height: "120px", borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "2px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "32px", marginLeft: "auto", marginRight: "auto" }}>
                      <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 0 40px rgba(16,185,129,0.4)" }}>
                        <CheckCircle2 size={48} />
                      </div>
                   </div>
                   <h2 style={{ fontSize: "42px", fontWeight: 900, color: "#10b981", textTransform: "uppercase", letterSpacing: "-0.02em", margin: 0 }}>Access Granted</h2>
                   <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.4)", fontWeight: 600, marginTop: "8px" }}>Welcome Back, {selectedProfile?.name}</p>
                </div>
              )}
            </div>

            {/* Telemetry Table */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", padding: "24px", marginTop: "auto" }}>
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                   <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>DOOR</span>
                   <span style={{ fontSize: "12px", fontWeight: 800, color: "#fff", fontFamily: "monospace" }}>{selectedPoint ? selectedPoint.name : '--'}</span>
                </div>
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>TIME</span>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#fff", fontFamily: "monospace" }}>{currentTime}</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin { from {transform: rotate(0deg)} to {transform: rotate(360deg)} }
        @keyframes fadeUp { from {opacity: 0; transform: translateY(15px)} to {opacity: 1; transform: translateY(0)} }
        @keyframes pulse { 0% { opacity: 0.5 } 50% { opacity: 1 } 100% { opacity: 0.5 } }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}

function HUDSelect({ value, icon, options, onSelect }: any) {
  const [open, setOpen] = useState(false);
  
  return (
    <div style={{ position: "relative" }}>
      <button 
        onClick={() => setOpen(!open)}
        style={{ 
          width: "100%", 
          background: "rgba(255,255,255,0.03)", 
          border: "1px solid rgba(255,255,255,0.08)", 
          borderRadius: "14px", 
          padding: "14px 16px", 
          color: "#fff", 
          fontSize: "14px", 
          display: "flex", 
          alignItems: "center", 
          gap: "12px", 
          cursor: "pointer",
          transition: "all .2s"
        }}>
        <div style={{ color: "rgba(255,255,255,0.2)" }}>{icon}</div>
        <span style={{ flex: 1, textAlign: "left", fontWeight: 500 }}>{value}</span>
        <div style={{ color: "rgba(255,255,255,0.2)", transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}><ChevronDown size={14} /></div>
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, width: "100%", background: "#0d121f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", overflow: "hidden", zIndex: 100, boxShadow: "0 10px 40px rgba(0,0,0,0.4)" }}>
          {options.map((opt: any) => (
            <button 
              key={opt.id || opt}
              onClick={() => { onSelect(opt); setOpen(false); }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.1)"}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
              style={{ width: "100%", padding: "12px 16px", border: "none", background: "transparent", color: "#fff", fontSize: "13px", fontWeight: 500, textAlign: "left", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.03)" }}
            >
              {opt.name || opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
