import { 
  Shield, User as UserIcon, MapPin, Calendar, Clock, 
  ChevronDown, Search, PlusCircle, LayoutGrid, 
  Trash2, AlertCircle, CheckCircle2
} from 'lucide-react';
import TacticalPicker from './TacticalPicker';
import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useState } from 'react';

interface PermissionEntry {
  id: string;
  userName: string;
  roomName: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  days: string[];
}

export default function PermissionManagement() {
  const { token, logout } = useAuthStore();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [allowedDays, setAllowedDays] = useState(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);
  
  // Dynamic Data State
  const [users, setUsers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchAttempt, setFetchAttempt] = useState(0);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        // Split Promise.all to identify the specific failure point
        console.log("SYNC_INIT_START");
        
        let uRes, zRes, pRes;
        try {
          uRes = await axios.get('/api/admin/list-users', config);
          setUsers(uRes.data);
          console.log("SYNC_USERS_OK");
        } catch (e: any) {
          console.error("SYNC_USERS_FAILED:", e.response?.data || e.message);
          throw e;
        }

        try {
          zRes = await axios.get('/api/zones', config);
          setRooms(zRes.data);
          console.log("SYNC_ZONES_OK");
        } catch (e: any) {
          console.error("SYNC_ZONES_FAILED:", e.response?.data || e.message);
          throw e;
        }

        try {
          pRes = await axios.get('/api/permissions', config);
          setPermissions(pRes.data);
          console.log("SYNC_PERMISSIONS_OK");
        } catch (e: any) {
          console.error("SYNC_PERMISSIONS_FAILED:", e.response?.data || e.message);
          throw e;
        }

        setLoading(false);
      } catch (err: any) {
        console.error("FAILED_SYNC_PERMISSION_DATA:", err.response?.data ? JSON.stringify(err.response.data, null, 2) : err.message);
        if (err.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token, logout, fetchAttempt]);

  // Form State
  const [activePicker, setActivePicker] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    startDate: 'dd-mm-yyyy',
    endDate: 'dd-mm-yyyy',
    startTime: '--:--',
    endTime: '--:--'
  });

  const [notif, setNotif] = useState<string | null>(null);

  const toggleDay = (day: string) => {
    setAllowedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSelect = (key: string, val: string) => {
    setFormData(prev => ({ ...prev, [key]: val }));
    setActivePicker(null);
  };

  const handleGrantAccess = async () => {
    if (!selectedUser || !selectedRoom) return;
    if (formData.startDate === 'dd-mm-yyyy' || formData.startTime === '--:--') {
       setNotif("INCOMPLETE TEMPORAL DATA");
       return;
    }
    
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = {
        userId: selectedUser.id,
        zoneId: selectedRoom.id,
        startDate: formData.startDate,
        endDate: formData.endDate === 'dd-mm-yyyy' ? '31-12-2099' : formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime === '--:--' ? '23:59' : formData.endTime,
        allowedDays
      };

      const res = await axios.post('/api/permissions', payload, config);
      
      const newEntry = {
        ...payload,
        id: res.data.id,
        userName: selectedUser.name,
        zoneName: selectedRoom.name
      };

      setPermissions(prev => [...prev, newEntry]);
      setNotif("ACCESS GRANTED SUCCESSFULLY");
      setTimeout(() => setNotif(null), 3000);

      // Reset Form
      setFormData({ startDate: 'dd-mm-yyyy', endDate: 'dd-mm-yyyy', startTime: '--:--', endTime: '--:--' });
    } catch (err) {
      setNotif("GOVERNANCE REJECTED REQUEST");
       setTimeout(() => setNotif(null), 3000);
    }
  };

  const revokeAccess = async (id: string) => {
    try {
      await axios.delete(`/api/permissions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setPermissions(prev => prev.filter(p => p.id !== id));
      setNotif("PERMISSION REVOKED");
      setTimeout(() => setNotif(null), 3000);
    } catch (err) {
      setNotif("REVOCATION FAILED");
      setTimeout(() => setNotif(null), 3000);
    }
  };

  const userPermissions = permissions.filter(p => p.userId === selectedUser?.id);
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <div style={{ padding: "40px", maxWidth: "1600px", margin: "0 auto", width: "100%", animation: "fadeUp .4s ease-out" }}>
      
      {/* Header HUD */}
      <header style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "40px", position: "relative" }}>
        <div style={{ padding: "12px", background: "rgba(59,130,246,0.1)", borderRadius: "16px", color: "#3b82f6" }}>
          <Shield size={28} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>Permission Management</h1>
          <p style={{ margin: "4px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Global facility governance layer.</p>
        </div>

        {/* Tactical Notification Banner */}
        {notif && (
          <div style={{ position: "absolute", top: "0", right: "0", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "12px", padding: "10px 20px", display: "flex", alignItems: "center", gap: "10px", color: "#22c55e", fontSize: "12px", fontWeight: 900, letterSpacing: "0.05em", animation: "slideInRight .3s forwards" }}>
             <CheckCircle2 size={16} />
             {notif}
          </div>
        )}
      </header>

      <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>
        
        {/* Left Control Center */}
        <div style={{ width: "380px", display: "flex", flexDirection: "column", gap: "24px", flexShrink: 0 }}>
          
          {/* User Selection Card */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "24px", padding: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <Search size={16} color="#3b82f6" />
                <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: "#fff", letterSpacing: "0.05em" }}>OPERATIVE SELECTION</h3>
             </div>
             <HUDSelect 
               value={selectedUser ? selectedUser.name : '-- Select a User --'} 
               icon={<UserIcon size={14} />} 
               options={users}
               onSelect={setSelectedUser}
             />
          </div>

          {/* New Permission Assignment Card */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "24px", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
             <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                <PlusCircle size={18} color="#3b82f6" />
                <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: "#fff", letterSpacing: "0.05em" }}>ASSIGN ACCESS RIGHT</h3>
             </div>

             <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>ACCESS POINT / ROOM</label>
                <HUDSelect 
                  value={selectedRoom ? selectedRoom.name : '-- Select Room --'} 
                  icon={<LayoutGrid size={14} />} 
                  options={rooms}
                  onSelect={setSelectedRoom}
                />
             </div>

             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative" }}>
                   <label style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>START DATE</label>
                   <HUDInput value={formData.startDate} icon={<Calendar size={14} />} interactive onToggle={() => setActivePicker('startDate')} />
                   {activePicker === 'startDate' && <TacticalPicker mode="date" onSelect={(v) => handleSelect('startDate', v)} onClose={() => setActivePicker(null)} />}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative" }}>
                   <label style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>END DATE</label>
                   <HUDInput value={formData.endDate} icon={<Calendar size={14} />} interactive onToggle={() => setActivePicker('endDate')} />
                   {activePicker === 'endDate' && <TacticalPicker mode="date" onSelect={(v) => handleSelect('endDate', v)} onClose={() => setActivePicker(null)} />}
                </div>
             </div>

             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative" }}>
                   <label style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>START TIME</label>
                   <HUDInput value={formData.startTime} icon={<Clock size={14} />} interactive onToggle={() => setActivePicker('startTime')} />
                   {activePicker === 'startTime' && <TacticalPicker mode="time" onSelect={(v) => handleSelect('startTime', v)} onClose={() => setActivePicker(null)} />}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative" }}>
                   <label style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>END TIME</label>
                   <HUDInput value={formData.endTime} icon={<Clock size={14} />} interactive onToggle={() => setActivePicker('endTime')} />
                   {activePicker === 'endTime' && <TacticalPicker mode="time" onSelect={(v) => handleSelect('endTime', v)} onClose={() => setActivePicker(null)} />}
                </div>
             </div>

             <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <label style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>ALLOWED DAYS</label>
                   <button onClick={() => setAllowedDays(allowedDays.length === 7 ? [] : days)} style={{ background: "transparent", border: "none", color: "#3b82f6", fontSize: "10px", fontWeight: 800, cursor: "pointer", opacity: 0.5 }}>{allowedDays.length === 7 ? 'Deselect All' : 'Select All'}</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                   {days.map(day => (
                      <button key={day} onClick={() => toggleDay(day)} style={{ padding: "10px 0", borderRadius: "10px", fontSize: "10px", fontWeight: 900, background: allowedDays.includes(day) ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.02)", border: `1px solid ${allowedDays.includes(day) ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.06)"}`, color: allowedDays.includes(day) ? "#3b82f6" : "rgba(255,255,255,0.15)", cursor: "pointer", transition: "all .2s" }}>{day}</button>
                   ))}
                </div>
             </div>

              <button 
                onClick={handleGrantAccess}
                disabled={!selectedUser || !selectedRoom}
                style={{ width: "100%", background: "#3b82f6", border: "none", borderRadius: "16px", padding: "16px", color: "#fff", fontSize: "14px", fontWeight: 950, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", cursor: (!selectedUser || !selectedRoom) ? "not-allowed" : "pointer", marginTop: "12px", boxShadow: "0 10px 25px rgba(59,130,246,0.3)", transition: "all .3s", opacity: (!selectedUser || !selectedRoom) ? 0.4 : 1 }}
             >
                <Shield size={16} />
                GRANT PERMIT
             </button>
          </div>
        </div>

        {/* Right Workspace Panel */}
        <div style={{ flex: 1, background: "rgba(13,20,36,0.4)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "32px", display: "flex", flexDirection: "column", overflow: "hidden", minHeight: "800px" }}>
          <header style={{ padding: "28px 32px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
             <h2 style={{ fontSize: "16px", fontWeight: 900, color: "#fff", letterSpacing: "0.02em", margin: 0, textTransform: "uppercase" }}>{!selectedUser ? 'Awaiting Personnel Selection' : `Active Permissions: ${selectedUser.name}`}</h2>
             {selectedUser && <div style={{ fontSize: "10px", fontWeight: 900, color: "rgba(34,197,94,0.6)", display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e" }} /> SYNCED</div>}
          </header>
          
          <div style={{ flex: 1, padding: "32px" }}>
             {!selectedUser ? (
               <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", animation: "pulse 3s infinite" }}>
                 <div style={{ width: "96px", height: "96px", borderRadius: "32px", border: "2px solid rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.05)", marginBottom: "24px" }}>
                   <Shield size={48} />
                 </div>
                 <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.2)", fontWeight: 600, letterSpacing: "0.02em", maxWidth: "240px", textAlign: "center" }}>Select personnel from the control pane to manage access architecture.</p>
               </div>
             ) : (
               <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
                  {userPermissions.length === 0 ? (
                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px dotted rgba(255,255,255,0.1)", borderRadius: "20px", padding: "60px", textAlign: "center" }}>
                       <AlertCircle size={32} color="rgba(255,255,255,0.1)" style={{ marginBottom: "16px", marginLeft: "auto", marginRight: "auto" }} />
                       <p style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.2)" }}>No active permissions provisioned for this personnel.</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                       <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
                          <thead>
                             <tr style={{ textAlign: "left" }}>
                                <th style={{ padding: "0 20px", fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Access Point</th>
                                <th style={{ padding: "0 20px", fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Validity (Temporal)</th>
                                <th style={{ padding: "0 20px", fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Shift Window</th>
                                <th style={{ padding: "0 20px", fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Active Days</th>
                                <th style={{ padding: "0 20px", fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", textAlign: "right" }}>Revoke</th>
                             </tr>
                          </thead>
                          <tbody>
                             {userPermissions.map(p => (
                                <tr key={p.id} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "16px", animation: "fadeUp .3s ease-out" }}>
                                    <td style={{ padding: "20px", borderRadius: "16px 0 0 16px" }}>
                                       <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6" }}><MapPin size={14} /></div>
                                          <span style={{ fontSize: "14px", fontWeight: 800, color: "#fff" }}>{p.zoneName || rooms.find(r => r.id === p.zoneId)?.name || 'Loading...'}</span>
                                       </div>
                                    </td>
                                   <td style={{ padding: "20px" }}>
                                      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: 600 }}>{p.startDate} <span style={{ color: "rgba(59,130,246,0.4)" }}>→</span> {p.endDate}</div>
                                   </td>
                                   <td style={{ padding: "20px" }}>
                                      <div style={{ background: "rgba(0,0,0,0.2)", padding: "4px 10px", borderRadius: "6px", display: "inline-block", fontSize: "12px", fontWeight: 800, color: "#fff" }}>{p.startTime} - {p.endTime}</div>
                                   </td>
                                   <td style={{ padding: "20px" }}>
                                      <div style={{ display: "flex", gap: "4px" }}>
                                         {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
                                            <div key={d} style={{ width: "20px", height: "16px", borderRadius: "4px", fontSize: "7px", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", background: p.days.includes(d) ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.03)", color: p.days.includes(d) ? "#3b82f6" : "rgba(255,255,255,0.1)", border: `1px solid ${p.days.includes(d) ? "rgba(59,130,246,0.3)" : "transparent"}` }}>{d.substring(0, 1)}</div>
                                         ))}
                                      </div>
                                   </td>
                                   <td style={{ padding: "20px", borderRadius: "0 16px 16px 0", textAlign: "right" }}>
                                      <button onClick={() => revokeAccess(p.id)} style={{ padding: "8px", borderRadius: "8px", background: "transparent", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", cursor: "pointer", transition: "all .2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}><Trash2 size={14} /></button>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                  )}
               </div>
             )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeUp { from {opacity: 0; transform: translateY(20px)} to {opacity: 1; transform: translateY(0)} }
        @keyframes slideInRight { from {opacity: 0; transform: translateX(20px)} to {opacity: 1; transform: translateX(0)} }
        @keyframes pulse { 0% { opacity: 0.7 } 50% { opacity: 1 } 100% { opacity: 0.7 } }
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

function HUDInput({ placeholder, icon, value, interactive, onToggle }: any) {
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <input 
        type="text" 
        readOnly={interactive}
        value={value}
        placeholder={placeholder}
        style={{ 
          width: "100%", 
          background: "rgba(255,255,255,0.02)", 
          border: "1px solid rgba(255,255,255,0.08)", 
          borderRadius: "14px", 
          padding: `14px 42px 14px 16px`, 
          color: value && !value.includes('-') && !value.includes(':') ? "#fff" : "rgba(255,255,255,0.08)", 
          fontSize: "14px", 
          outline: "none",
          transition: "all .2s"
        }}
      />
      <div 
        onClick={onToggle}
        style={{ 
          position: "absolute", 
          right: "12px", 
          color: "rgba(59,130,246,0.4)",
          padding: "6px",
          borderRadius: "8px",
          background: "rgba(59,130,246,0.05)",
          border: "1px solid rgba(59,130,246,0.1)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all .2s"
        }}>
        {icon}
      </div>
    </div>
  );
}
