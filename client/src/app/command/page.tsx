'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { 
  ShieldCheck, Users, MapPin, Clock, Activity, AlertTriangle, 
  Search, LogOut, LayoutDashboard, Map as MapIcon, Shield, 
  Zap, Settings as SettingsIcon, Download, UserPlus, Sparkles, 
  CheckCircle2, XCircle, MoreVertical, Key, Eye, EyeOff, 
  Copy, RefreshCw, Filter, Cpu, Monitor, Lock, Unlock,
  Edit2, Trash2, Fingerprint, Building2, Badge, ArrowLeft,
  Globe, Mail, Phone, Calendar, ChevronDown, X
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import axios from 'axios';

import AdminSettings from './components/AdminSettings';
import AccessSimulator from './components/AccessSimulator';
import PermissionManagement from './components/PermissionManagement';
import UserDirectory from './components/UserDirectory';
import ZoneManagement from './components/ZoneManagement';

// --- MOCK DATA FOR NEW DASHBOARD ---
const SPARK = [12, 18, 9, 24, 31, 27, 14, 38, 42, 36, 29, 45, 39, 52, 48, 35];
const HOURLY = [
  { h: "06", granted: 4,  denied: 0 }, { h: "07", granted: 12, denied: 1 },
  { h: "08", granted: 28, denied: 2 }, { h: "09", granted: 41, denied: 3 },
  { h: "10", granted: 35, denied: 1 }, { h: "11", granted: 22, denied: 4 },
  { h: "12", granted: 18, denied: 1 }, { h: "13", granted: 31, denied: 0 },
  { h: "14", granted: 44, denied: 2 }, { h: "15", granted: 38, denied: 5 },
  { h: "16", granted: 29, denied: 1 }, { h: "17", granted: 15, denied: 0 },
];
const RECENT_LOGS = [
  { id: 1, ts: "05:32:40 PM", user: "Thomas Jones",   role: "Staff",   status: "granted", zone: "CIT-LOBBY", method: "NFC"       },
  { id: 2, ts: "05:28:11 PM", user: "Charles Smith",  role: "Staff",   status: "denied",  zone: "CIT-SRV",   method: "NFC Mobile"},
  { id: 3, ts: "05:14:37 PM", user: "Patricia Davis", role: "Manager", status: "granted", zone: "CIT-EXEC",  method: "Biometric" },
  { id: 4, ts: "04:56:10 PM", user: "William Davis",  role: "Staff",   status: "granted", zone: "CIT-ENG",   method: "NFC"       },
  { id: 5, ts: "04:22:55 PM", user: "Barbara Davis",  role: "Staff",   status: "denied",  zone: "CIT-SRV",   method: "PIN"       },
  { id: 6, ts: "03:57:14 PM", user: "Linda Martinez", role: "Admin",   status: "granted", zone: "CIT-CAFE",  method: "NFC"       },
];
const TOP_ZONES = [
  { name: "CIT Lobby",   events: 142, pct: 100, color: "#0ea5e9" },
  { name: "Dev Hub",     events: 98,  pct: 69,  color: "#22c55e" },
  { name: "Cafeteria",   events: 87,  pct: 61,  color: "#a78bfa" },
  { name: "Server Vault",events: 34,  pct: 24,  color: "#f59e0b" },
  { name: "Exec Suite",  events: 21,  pct: 15,  color: "#64748b" },
];

const MAP_FEED = [
  { id: 1, name: "Thomas Jones", action: "ENTRY", loc: "CIT-LOBBY", time: "05:32", type: "entry" },
  { id: 2, name: "Charles Smith", action: "ENTRY", loc: "CIT-SRV", time: "04:56", type: "entry" },
  { id: 3, name: "Patricia Davis", action: "ENTRY", loc: "CIT-SRV", time: "04:52", type: "entry" },
  { id: 4, name: "William Davis", action: "EXIT", loc: "CIT-LOBBY", time: "04:19", type: "exit" },
  { id: 5, name: "Barbara Davis", action: "EXIT", loc: "CIT-EXEC", time: "04:14", type: "exit" },
  { id: 6, name: "Linda Martinez", action: "ENTRY", loc: "CIT-ENG", time: "03:57", type: "entry" },
  { id: 7, name: "Elizabeth Jones", action: "DENIED", loc: "CIT-SRV", time: "03:26", type: "denied" },
  { id: 8, name: "Mark Wilson", action: "ALERT", loc: "CIT-CAFE", time: "02:58", type: "alert" },
];

const ZONE_CAPACITIES = [
  { name: "Main Entrance", current: 8, max: 30, color: "#22c55e" },
  { name: "Lobby", current: 41, max: 60, color: "#a78bfa" },
  { name: "Server Vault", current: 2, max: 8, color: "#f59e0b" },
  { name: "Dev Hub", current: 22, max: 40, color: "#22c55e" },
];
const INITIAL_ALERTS = [
  { id: 1, type: "denied_spike",  msg: "4 denied events in Server Vault", time: "2m ago",  sev: "high"   },
  { id: 2, type: "zone_crowded",  msg: "Cafeteria at 91% capacity",       time: "8m ago",  sev: "medium" },
  { id: 3, type: "reader_offline",msg: "Reader CIT-ENT-02 went offline",  time: "23m ago", sev: "high"   },
];
const SYS_SERVICES = [
  { name: "Core API",     value: "99.9%", sub: "uptime",    color: "#22c55e", icon: "◈" },
  { name: "Network",      value: "12ms",  sub: "latency",   color: "#0ea5e9", icon: "◎" },
  { name: "Security",     value: "ACTIVE",sub: "status",    color: "#22c55e", icon: "⬡" },
  { name: "Active Scans", value: "1/hr",  sub: "scan rate", color: "#f59e0b", icon: "◷" },
];

const mockLogs = [
  { id: 'LOG-992', time: '02:14:32 PM', user: 'Elizabeth Chen', zone: 'R&D HUB', status: 'GRANTED', reason: '-' },
  { id: 'LOG-991', time: '02:11:05 PM', user: 'Unknown Guest', zone: 'SERVER B', status: 'DENIED', reason: 'INVALID_SIGNATURE' },
  { id: 'LOG-990', time: '01:58:12 PM', user: 'Dr. Robert Ford', zone: 'MAIN GATE', status: 'GRANTED', reason: '-' },
  { id: 'LOG-989', time: '01:45:30 PM', user: 'Sarah Jenkins', zone: 'HR OFFICE', status: 'DENIED', reason: 'INSUFFICIENT_CLEARANCE' },
  { id: 'LOG-988', time: '01:30:00 PM', user: 'Michael Ross', zone: 'SERVER B', status: 'GRANTED', reason: '-' },
];

export default function AdminPortal() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#020617] flex items-center justify-center animate-pulse text-blue-500 font-black uppercase tracking-widest text-xs">Initializing Tactical_Command...</div>}>
      <AdminPortalContent />
    </Suspense>
  );
}

function AdminPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const { user, _hasHydrated, logout, token } = useAuthStore();
  const initialTab = searchParams.get('tab') || 'overview';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [tick, setTick] = useState(0);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [maskPII, setMaskPII] = useState(false);
  const [logFilter, setLogFilter] = useState("all");
  const [focusedUser, setFocusedUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);

  const fetchUsers = async () => {
    if (!token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/admin/list-users', config);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('FAILED_FETCH_USERS:', err.message);
      if (err.response?.status === 401) logout();
    }
  };

  const fetchEvents = async () => {
    if (!token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/events', config);
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('FAILED_FETCH_EVENTS:', err.message);
      if (err.response?.status === 401) logout();
    }
  };

  const fetchZones = async () => {
    if (!token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/zones', config);
      setZones(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('FAILED_FETCH_ZONES:', err.message);
      if (err.response?.status === 401) logout();
    }
  };

  // Tactical Sync Heartbeat (5s)
  useEffect(() => {
    if (_hasHydrated && token) {
      // Immediate fetch
      fetchUsers();
      fetchEvents();
      fetchZones();

      // Interval fetch
      const interval = setInterval(() => {
        fetchUsers();
        fetchEvents();
        fetchZones();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [_hasHydrated, token]);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', activeTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [activeTab, pathname, router, searchParams, _hasHydrated, user]);

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
    setCurrentDate(new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }));
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
      setTick(n => n + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!_hasHydrated) return (
    <div className="h-screen bg-[#020617] flex items-center justify-center">
       <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-blue-500 font-black tracking-widest text-xs uppercase animate-pulse">Synchronizing Secure_Core...</span>
       </div>
    </div>
  );

  const handleLogout = () => {
    router.push('/logout');
  };


  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return (
        <CommandCenterOverview 
          currentTime={currentTime} 
          currentDate={currentDate}
          tick={tick}
          alerts={alerts}
          setAlerts={setAlerts}
          maskPII={maskPII}
          setMaskPII={setMaskPII}
          logFilter={logFilter}
          setLogFilter={setLogFilter}
          events={events}
        />
      );
      case 'map': return <LiveMap zones={zones} events={events} />;
      case 'infrastructure': return <ZoneManagement zones={zones} setZones={setZones} refreshZones={fetchZones} />;
      case 'zones': return <PermissionManagement />;
      case 'simulator': return <AccessSimulator users={users} />;
      case 'logs': return <AuditLogs events={events} />;
      case 'users': return (
        <UserDirectory 
          users={users} 
          setUsers={setUsers} 
          refreshUsers={fetchUsers}
          onUserCreated={(u) => { setFocusedUser(u); setActiveTab('user-focus'); }} 
        />
      );
      case 'user-focus': return <IdentityFocus user={focusedUser} onBack={() => setActiveTab('users')} events={events} />;
      case 'profile': return <MyProfile />;
      case 'settings': return <AdminSettings user={user} />;
      default: return <CommandCenterOverview currentTime={currentTime} currentDate={currentDate} tick={0} alerts={[]} setAlerts={()=>{}} maskPII={false} setMaskPII={()=>{}} logFilter="all" setLogFilter={()=>{}} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 font-sans overflow-hidden">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 border-r border-slate-800/50 flex flex-col bg-[#020617] z-50">
        <div className="p-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tighter text-white uppercase italic">SmartAccess</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={18} />} label="DASHBOARD" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavItem icon={<MapIcon size={18} />} label="LIVE MAP" active={activeTab === 'map'} onClick={() => setActiveTab('map')} />
          <NavItem icon={<Building2 size={18} />} label="INFRASTRUCTURE" active={activeTab === "infrastructure"} onClick={() => setActiveTab("infrastructure")} />
          <NavItem icon={<Shield size={18} />} label="RULES / CONTROL" active={activeTab === 'zones'} onClick={() => setActiveTab('zones')} />
          <NavItem icon={<Monitor size={18} />} label="SIMULATOR" active={activeTab === 'simulator'} onClick={() => setActiveTab('simulator')} />
          <NavItem icon={<Clock size={18} />} label="ACCESS LOGS" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
          <NavItem icon={<Users size={18} />} label="USERS" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          <NavItem icon={<Fingerprint size={18} />} label="MY PROFILE" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <NavItem icon={<SettingsIcon size={18} />} label="SETTINGS" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="px-6 py-6 border-t border-slate-800/30 flex flex-col gap-4">
           {/* Search Bar HUD */}
           <div className="relative group/search">
              <input type="text" placeholder="Search" className="bg-[#0b1424] border border-white/5 rounded-xl py-2.5 pl-9 pr-12 text-[11px] text-slate-400 focus:border-blue-500/50 outline-none w-full transition-all" />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-40 group-focus-within/search:opacity-100 transition-opacity">
                <kbd className="text-[8px] px-1 border border-white/20 rounded bg-white/5 text-slate-500">⌘</kbd>
                <kbd className="text-[8px] px-1 border border-white/20 rounded bg-white/5 text-slate-500">K</kbd>
              </div>
           </div>

           {/* User Node */}
           <div 
             onClick={() => setActiveTab('profile')}
             className={`flex items-center gap-3 p-3 rounded-2xl border transition-all group cursor-pointer ${activeTab === 'profile' ? 'bg-blue-600/10 border-blue-500/30' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'}`}
           >
             <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-xs shadow-inner">
               {user?.name?.[0].toUpperCase() || 'C'}
             </div>
             <div className="flex-1 overflow-hidden">
               <p className="text-[11px] font-black text-white italic truncate uppercase">{user?.name || 'CIT Admin'}</p>
               <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest leading-none">{user?.role || 'ADMIN'}</p>
             </div>
           </div>

           <button 
             onClick={handleLogout}
             className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-black text-slate-500 hover:text-red-400 uppercase tracking-widest transition-colors active:scale-95"
           >
             <LogOut size={14} />
             SIGN OUT
           </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col min-w-0 relative overflow-y-auto custom-scrollbar bg-[#020617]">
        {renderContent()}
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
        @keyframes scan-line { 0% { top: 0; } 100% { top: 100%; } }
        .animate-scan-line { animation: scan-line 3s linear infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.15} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
      `}</style>
    </div>
  );
}

// ==========================================
// 1. COMMAND CENTER OVERVIEW (PRO VERSION)
// ==========================================
const CommandCenterOverview = ({ currentTime, currentDate, tick, alerts, setAlerts, maskPII, setMaskPII, logFilter, setLogFilter, events }: any) => {
  const filteredEvents = events.filter((e: any) => logFilter === "all" || e.status.toLowerCase() === logFilter.toLowerCase());

  return (
    <div className="flex flex-col h-full bg-[#070a10] text-[#fff] animate-in fade-in duration-300">
      {/* Top bar */}
      <header className="p-6 border-b border-white/5 flex items-center gap-3 shrink-0 bg-[#040609]/80 backdrop-blur-xl z-20">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black tracking-tighter uppercase italic font-mono">Command Center</h1>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
              <Blink color="#22c55e" />
              <span className="text-[10px] text-emerald-400 font-black tracking-widest uppercase">Live Analytics</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            System status · All services operational · Updated {Math.floor(tick / 4) * 4}s ago
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2 font-mono">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Context: {currentDate || 'LOADING...'}</span>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6 scrollbar-hide">
        {/* Alert strip */}
        {alerts.length > 0 && (
          <div className="flex gap-4 animate-in slide-in-from-left duration-500">
            {alerts.map((a: any) => (
              <div key={a.id} className={`flex-1 flex items-center gap-4 p-3 rounded-2xl border ${a.sev === "high" ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/5 border-amber-500/20'}`}>
                <span className="text-xl">{a.sev === "high" ? "🚨" : "⚠️"}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-black uppercase tracking-tight truncate ${a.sev === "high" ? 'text-red-500' : 'text-amber-500'}`}>{a.msg}</p>
                  <p className="text-[9px] font-bold text-slate-600 uppercase mt-0.5">{a.time}</p>
                </div>
                <button onClick={() => setAlerts(alerts.filter((x: any) => x.id !== a.id))} className="text-slate-600 hover:text-white transition-colors">✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Row 1: KPI HUD */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: "Total Events",    value: events.length.toString(),   delta: "+12%", color: "#0ea5e9", spark: SPARK },
            { label: "Access Granted",  value: events.filter((e: any) => e.status.toLowerCase() === 'granted').length.toString(),   delta: "+8%",  color: "#22c55e", spark: SPARK.map(v => v * 0.9) },
            { label: "Access Denied",   value: events.filter((e: any) => e.status.toLowerCase() !== 'granted').length.toString(),    delta: "+2",   color: "#ef4444", spark: SPARK.map(v => Math.round(v * 0.12)) },
            { label: "Active Sessions", value: "125",  delta: "live", color: "#a78bfa", spark: SPARK.map(v => v * 3) },
            { label: "Denial Rate",     value: events.length > 0 ? ((events.filter((e: any) => e.status.toLowerCase() !== 'granted').length / events.length) * 100).toFixed(1) + "%" : "0.0%", delta: "-2%",  color: "#f59e0b", spark: SPARK.map(v => v * 0.1) },
          ].map(s => (
            <div key={s.label} className="bg-white/[0.03] border border-white/[0.08] rounded-[24px] p-4 flex flex-col relative overflow-hidden group hover:bg-white/[0.05] transition-all">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-black font-mono tracking-tighter" style={{ color: s.color }}>{s.value}</p>
                <span className="text-[9px] font-black mb-1" style={{ color: s.delta.startsWith('+') ? '#22c55e' : s.delta.startsWith('-') ? '#ef4444' : 'rgba(255,255,255,0.4)' }}>{s.delta}</span>
              </div>
              <div className="mt-4 opacity-70 group-hover:opacity-100 transition-opacity">
                <Sparkline data={s.spark} color={s.color} height={30} />
              </div>
            </div>
          ))}
        </div>

        {/* Row 2: Tactical HUDs */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4 bg-white/[0.03] border border-white/[0.08] rounded-[32px] p-6 flex flex-col shadow-2xl relative overflow-hidden">
             <div className="flex items-center justify-between mb-6">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Health</span>
               <Blink color="#22c55e" />
             </div>
             <div className="grid grid-cols-2 gap-4 flex-1">
               {SYS_SERVICES.map((s: any) => (
                 <div key={s.name} className="space-y-1">
                    <div className="flex items-center gap-2">
                       <span className="text-sm" style={{ color: s.color }}>{s.icon}</span>
                       <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{s.name}</span>
                    </div>
                    <p className="text-lg font-black font-mono" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[8px] font-bold text-slate-700 uppercase">{s.sub}</p>
                 </div>
               ))}
             </div>
             <div className="mt-8 pt-6 border-t border-white/[0.05]">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Platform Integrity</span>
                   <span className="text-[9px] font-black text-emerald-500">99.2%</span>
                </div>
                <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                   <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500" style={{ width: '99.2%' }} />
                </div>
             </div>
          </div>

          <div className="col-span-12 lg:col-span-8 bg-white/[0.03] border border-white/[0.08] rounded-[32px] p-6 flex flex-col shadow-2xl relative overflow-hidden">
             <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hourly Density</span>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 ">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-[8px] font-black text-slate-700 uppercase">Granted</span>
                  </div>
                  <div className="flex items-center gap-1.5 ">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span className="text-[8px] font-black text-slate-700 uppercase">Denied</span>
                  </div>
                </div>
             </div>
             <HourlyChart data={HOURLY} />
             <div className="mt-8 grid grid-cols-3 gap-3">
               {[
                  { label: "Peak Hour", value: "09:00" },
                  { label: "Avg/hr",    value: "28.4"  },
                  { label: "Deny Rate", value: "8.2%"  },
                ].map(s => (
                  <div key={s.label} className="bg-white/[0.04] p-2.5 rounded-2xl text-center border border-white/[0.05]">
                     <p className="text-xs font-black font-mono text-white mb-0.5">{s.value}</p>
                     <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{s.label}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Row 3: Live Logs + Rankings */}
        <div className="grid grid-cols-12 gap-6">
           <div className="col-span-12 lg:col-span-8 bg-white/[0.03] border border-white/[0.08] rounded-[32px] overflow-hidden flex flex-col shadow-2xl">
              <header className="px-6 py-4 border-b border-white/[0.05] flex justify-between items-center bg-[#040609]/40 backdrop-blur-md">
                 <div className="flex items-center gap-3">
                   <Blink color="#0ea5e9" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Activity Streams</span>
                 </div>
                 <div className="flex items-center gap-2">
                    {["all","granted","denied"].map(f => (
                      <button key={f} onClick={() => setLogFilter(f)} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${logFilter === f ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-white'}`}>{f}</button>
                    ))}
                    <div className="w-[1px] h-3 bg-white/10 mx-2" />
                    <button className="text-[9px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest">View All →</button>
                 </div>
              </header>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="border-b border-white/[0.04]">
                       <tr className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] bg-white/[0.01]">
                          <th className="px-6 py-4">Timestamp</th>
                          <th className="px-6 py-4">Identity</th>
                          <th className="px-6 py-4">Context</th>
                          <th className="px-6 py-4">Zone</th>
                          <th className="px-6 py-4">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                       {filteredEvents.length === 0 ? (
                         <tr>
                            <td colSpan={5} className="px-6 py-12 text-center">
                               <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]">No Activity Logs Detected in Current Cycle</p>
                            </td>
                         </tr>
                       ) : filteredEvents.map((log: any) => (
                         <tr key={log.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4">
                               <span className="text-[10px] font-mono text-slate-600 font-bold">
                                 {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                               </span>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center font-black text-slate-500 group-hover:text-blue-400 transition-colors">
                                    {(log.user?.name || 'U')[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-xs font-black text-white">{maskPII ? (log.user?.name || 'Unknown').split(' ')[0] + " ●●●" : (log.user?.name || 'Unknown User')}</p>
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{log.user?.role || 'EXTERNAL'}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-4"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">NFC / BIOMETRIC</span></td>
                            <td className="px-6 py-4"><span className="px-2 py-0.5 bg-white/[0.05] border border-white/[0.08] rounded-md text-[9px] font-black text-slate-400 uppercase tracking-widest">{log.zone?.name || 'ZONE_NULL'}</span></td>
                            <td className="px-6 py-4">
                               <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${log.status.toLowerCase() === 'granted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{log.status}</span>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           <div className="col-span-12 lg:col-span-4 bg-white/[0.03] border border-white/[0.08] rounded-[32px] p-6 flex flex-col shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Traffic Zones</span>
                 <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.2em]">Today</span>
              </div>
              <div className="space-y-6 flex-1">
                 {TOP_ZONES.map((z, i) => (
                   <div key={z.name} className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                         <div className="flex items-center gap-2">
                           <span className="text-slate-700 font-mono w-4">{i + 1}</span>
                           <span className="text-white">{z.name}</span>
                         </div>
                         <span style={{ color: z.color }} className="font-mono">{z.events}</span>
                      </div>
                      <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                         <div className="h-full transition-all duration-1000" style={{ width: `${z.pct}%`, backgroundColor: z.color }} />
                      </div>
                   </div>
                 ))}
              </div>

              </div>
           </div>
        </div>
      </div>
  );
};

// ==========================================
// 2. LIVE MAP (PRESERVED)
// ==========================================

// ==========================================
// 4. ZONE PERMISSIONS (PRESERVED)
// ==========================================
const ZonePermissions = () => (
  <div className="p-10 animate-in fade-in duration-300">
    <header className="flex justify-between items-end mb-10">
      <div>
        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Zone Governance</h1>
        <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-black">Physical Perimeter Definitions</p>
      </div>
      <button className="px-5 py-2.5 bg-slate-900 border border-slate-800 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all">Add New Zone</button>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       <ZoneCard name="MAIN LOBBY" id="Z-01" level="Level 1+" capacity={500} status="OPEN" />
       <ZoneCard name="R&D HUB" id="Z-02" level="Level 3+" capacity={50} status="OPEN" />
       <ZoneCard name="SERVER VAULT B" id="Z-03" level="Level 5" capacity={5} status="RESTRICTED" alert />
       <ZoneCard name="EXECUTIVE SUITE" id="Z-04" level="Level 4+" capacity={20} status="OPEN" />
       <ZoneCard name="WEST GATE" id="Z-05" level="Level 2+" capacity={150} status="LOCKED" alert />
    </div>
  </div>
);

const ZoneCard = ({ name, id, level, capacity, status, alert }: any) => (
  <div className={`bg-slate-900/40 border rounded-[32px] p-8 relative overflow-hidden group ${alert ? 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-slate-800 hover:border-slate-700'}`}>
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${alert ? 'bg-red-500/10 text-red-500' : 'bg-slate-950 text-blue-400'}`}>
        {alert ? <Lock size={20} /> : <Unlock size={20} />}
      </div>
      <span className={`px-2.5 py-1 rounded text-[9px] font-black tracking-widest uppercase ${alert ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{status}</span>
    </div>
    <div className="relative z-10">
       <p className="text-[10px] font-mono text-slate-500 mb-1">{id}</p>
       <h3 className="text-lg font-black text-white uppercase tracking-tight mb-4">{name}</h3>
       <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 border-t border-slate-800/50 pt-4">
          <span>REQ: <span className="text-blue-400">{level}</span></span>
          <span>CAPACITY: {capacity}</span>
       </div>
    </div>
  </div>
);

const ZoneDetailModal = ({ zone, events, onClose }: any) => {
  if (!zone) return null;

  // Filter events for this zone to build the roster
  const roster = events
    .filter((e: any) => e.zone_id === zone.id && e.status.toLowerCase() === 'granted')
    .slice(0, 8); // Show last 8 verified entries

  const lastSync = roster.length > 0 ? new Date(roster[0].created_at).toLocaleTimeString() : new Date().toLocaleTimeString();
  const riskLevel = events.filter((e: any) => e.zone_id === zone.id && e.status.toLowerCase() === 'denied').length > 5 ? "HIGH" : "LOW";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl animate-in fade-in duration-300 p-6">
       <div className="bg-[#0b1424] border border-white/10 rounded-[48px] w-full max-w-5xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500 flex flex-col md:flex-row h-[600px]">
          
          {/* Left Side: Stats & Actions */}
          <div className="flex-1 p-12 flex flex-col justify-between border-r border-white/5">
             <div>
                <header className="flex items-center gap-4 mb-10">
                   <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]" />
                   <div className="flex flex-col">
                      <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">{zone.name}</h2>
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest w-fit">{zone.code || zone.id.substring(0, 8).toUpperCase()}</span>
                   </div>
                </header>

                <div className="grid grid-cols-2 gap-6 mb-12">
                   <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 transition-all hover:bg-white/[0.04]">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Current Occupancy</p>
                      <p className="text-2xl font-black text-white italic tracking-tighter">{zone.occupancy} / {zone.capacity || 100}</p>
                   </div>
                   <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 transition-all hover:bg-white/[0.04]">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Zone State</p>
                      <p className="text-2xl font-black text-emerald-400 italic tracking-tighter">NORMAL</p>
                   </div>
                   <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 transition-all hover:bg-white/[0.04]">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Security Risk Level</p>
                      <p className={`text-2xl font-black italic tracking-tighter ${riskLevel === 'HIGH' ? 'text-red-500' : 'text-blue-500'}`}>{riskLevel}</p>
                   </div>
                   <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 transition-all hover:bg-white/[0.04]">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Last Synchronized</p>
                      <p className="text-2xl font-black text-slate-400 italic tracking-tighter font-mono">{lastSync}</p>
                   </div>
                </div>
             </div>

             <div className="flex gap-4 pt-8 border-t border-white/5">
                <button className="flex-1 py-4 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-95">
                   Export Access Report
                </button>
                <button className="flex-1 py-4 bg-red-600/10 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-95">
                   Initiate Lockdown Protocol
                </button>
             </div>
          </div>

          {/* Right Side: Roster */}
          <div className="w-[400px] bg-black/40 flex flex-col">
             <header className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Verified User Roster</span>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-500 hover:text-white">
                   <X size={20} />
                </button>
             </header>

             <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
                {roster.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                    <Users size={48} className="mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">No active verified<br/>personnel in sector</p>
                  </div>
                ) : roster.map((log: any) => (
                  <div key={log.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex items-center justify-between group hover:border-blue-500/20 transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-xs">
                           {log.user?.name?.[0] || 'U'}
                        </div>
                        <div>
                           <p className="text-xs font-black text-white group-hover:text-blue-400 transition-colors">{log.user?.name || 'Unknown User'}</p>
                           <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{log.user?.role || 'Staff'}</p>
                        </div>
                     </div>
                     <span className="text-[10px] font-mono font-bold text-emerald-500/50">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </span>
                  </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
};

const MapArchitect = ({ floor }: { floor: number }) => {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-20">
      {/* Perimeter Walls */}
      <div className="absolute inset-4 border-2 border-blue-500/30 rounded-[32px]" />
      <div className="absolute inset-8 border border-blue-500/10 rounded-[24px]" />
      
      {/* Internal Divisions - Schematic Style */}
      {floor === 1 && (
        <>
          <div className="absolute top-1/4 left-4 right-1/2 h-[1px] bg-blue-500/20" />
          <div className="absolute top-1/2 left-1/4 right-4 h-[1px] bg-blue-500/20" />
          <div className="absolute top-4 bottom-1/2 left-1/2 w-[1px] bg-blue-500/20" />
          <div className="absolute top-1/2 bottom-4 left-1/4 w-[1px] bg-blue-500/20" />
          
          {/* Room Labels */}
          <div className="absolute top-[12.5%] left-10 text-[7px] font-black text-blue-500/40 uppercase tracking-[0.2em]">Exec_Sector</div>
          <div className="absolute top-[12.5%] left-[30%] text-[7px] font-black text-blue-500/40 uppercase tracking-[0.2em]">Dining_Zone</div>
          <div className="absolute top-[37.5%] left-[55%] text-[7px] font-black text-blue-500/40 uppercase tracking-[0.2em]">Main_Vault</div>
          <div className="absolute top-[75%] left-[10%] text-[7px] font-black text-blue-500/40 uppercase tracking-[0.2em]">Innovation_Lab</div>
        </>
      )}

      {/* Grid Markers */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[6px] font-black text-blue-400">AXIS_Y_00</div>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 px-1 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[6px] font-black text-blue-400 vertical-text" style={{ writingMode: 'vertical-rl' }}>AXIS_X_00</div>
    </div>
  );
};

// ==========================================
// 2. LIVE MAP (TACTICAL PRO VERSION)
// ==========================================
const LiveMap = ({ zones = [], events = [] }: { zones: any[], events: any[] }) => {
  const [floor, setFloor] = useState(1);
  const [view, setView] = useState("Status");
  const [feedFilter, setFeedFilter] = useState('All');
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  // Tactical Positioning Lookup
  const ZONE_LOOKUP: Record<string, any> = {
    'Executive Suite': { top: '15%', left: '12%', color: '#22c55e', icon: <Shield size={12} /> },
    'Cafeteria': { top: '15%', left: '32%', color: '#0ea5e9', icon: <MapPin size={12} /> },
    'Server Vault': { top: '35%', left: '55%', color: '#f59e0b', icon: <Lock size={12} /> },
    'Innovation Lab': { top: '75%', left: '15%', color: '#a78bfa', icon: <Zap size={12} /> },
    'Lobby': { top: '65%', left: '35%', color: '#22c55e', icon: <Users size={12} /> },
    'Dev Hub': { top: '45%', left: '35%', color: '#0ea5e9', icon: <Cpu size={12} /> },
    'Main Entrance': { top: '85%', left: '35%', color: '#22c55e', icon: <LayoutDashboard size={12} /> },
  };

  const selectedZone = zones.find(z => z.id === selectedZoneId);

  // Filter geospatial feed events
  const geoEvents = events.filter(e => {
    const status = e.status?.toLowerCase() || '';
    if (feedFilter === 'All') return true;
    if (feedFilter === 'Entry') return status === 'granted';
    if (feedFilter === 'Denied') return status === 'denied';
    return true;
  }).slice(0, 15);

  return (
    <div className="flex flex-col h-full bg-[#05080c] text-white animate-in fade-in duration-500 overflow-hidden">
      {/* Detail Modal Layer */}
      <ZoneDetailModal 
        zone={selectedZone} 
        events={events} 
        onClose={() => setSelectedZoneId(null)} 
      />

      {/* Tactical Header */}
      <header className="p-6 border-b border-white/[0.05] flex items-center justify-between shrink-0 bg-[#040609]/60 backdrop-blur-xl z-20">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter uppercase italic font-mono text-blue-500 leading-none mb-1">Live Facility Map</h1>
            <span className="text-[8px] font-black tracking-[0.4em] text-slate-600 uppercase">Geospatial Protocol v2.8</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
            <span className="text-[10px] text-emerald-400 font-black tracking-widest uppercase">Sync Active</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4" />

        {/* Tactical Map Grid */}
        <div className="flex-1 relative overflow-hidden p-8 flex items-center justify-center">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />

          <div className="relative w-full h-full max-w-4xl border border-white/[0.05] bg-black/20 rounded-[40px] p-8 overflow-hidden shadow-inner backdrop-blur-sm">
            <div className="absolute top-6 right-8 text-[10px] font-black text-white/10 italic">N↑</div>
            <div className="absolute bottom-6 left-8 text-[10px] font-black text-white/10 italic tracking-widest uppercase text-slate-700">Operational Sector {floor}</div>
            
            <div className="relative h-full w-full">
              <MapArchitect floor={floor} />
              
              {zones.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center opacity-20 animate-pulse">
                   <Monitor size={80} className="text-slate-500" />
                </div>
              ) : zones.map(zone => {
                const config = (zone.pos_x !== undefined && zone.pos_y !== undefined) 
                  ? { top: `${zone.pos_y}%`, left: `${zone.pos_x}%`, color: '#6366f1', icon: <MapPin size={12} /> }
                  : (ZONE_LOOKUP[zone.name] || { top: '50%', left: '50%', color: '#64748b' });
                return (
                  <TacticalMapNode 
                    key={zone.id}
                    name={zone.name}
                    id={zone.id.substring(0, 8).toUpperCase()}
                    pos={{ top: config.top, left: config.left }}
                    occupancy={zone.occupancy}
                    capacity={zone.capacity}
                    color={config.color}
                    alert={zone.occupancy >= (zone.capacity || 100)}
                    icon={config.icon}
                    onClick={() => setSelectedZoneId(zone.id)}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Operational Sidebar */}
        <aside className="w-[380px] border-l border-white/[0.05] bg-[#040609]/40 flex flex-col shrink-0 relative z-20 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="px-6 py-6 border-b border-white/[0.05] flex justify-between items-center bg-white/[0.02]">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" /> Geospatial Feed
              </span>
              <Activity size={16} className="text-blue-500/50" />
            </header>
            
            <div className="p-4 flex gap-2 bg-black/20 border-b border-white/[0.03]">
              {["All", "Entry", "Denied"].map(f => (
                <button 
                  key={f} 
                  onClick={() => setFeedFilter(f)}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${feedFilter === f ? 'bg-blue-600/20 text-blue-400' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 custom-scrollbar">
              {geoEvents.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-6">
                  <Activity size={32} className="mb-4" />
                  <p className="text-[9px] font-black uppercase tracking-widest">Awaiting sector events...</p>
                </div>
              ) : geoEvents.map(event => (
                <GeospatialFeedItem 
                  key={event.id}
                  name={event.user?.name || 'Personnel Detected'}
                  action={event.status}
                  loc={event.zone?.name || 'Sector Unknown'}
                  time={new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  isDenied={event.status.toLowerCase() === 'denied'}
                  isEntry={event.status.toLowerCase() === 'granted'}
                />
              ))}
            </div>
          </div>

          {/* Sector Capacity Metrics */}
          <div className="p-8 border-t border-white/[0.05] bg-black/40 shadow-[0_-20px_40px_-10px_rgba(0,0,0,0.5)]">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Sector Capacities</h3>
            <div className="space-y-6">
              {zones.slice(0, 5).map(zone => {
                const config = (zone.pos_x !== undefined && zone.pos_y !== undefined) 
                  ? { top: `${zone.pos_y}%`, left: `${zone.pos_x}%`, color: '#6366f1', icon: <MapPin size={12} /> }
                  : (ZONE_LOOKUP[zone.name] || { top: '50%', left: '50%', color: '#64748b' });
                return (
                  <div key={zone.id} className="group cursor-default">
                    <div className="flex justify-between text-[11px] font-bold uppercase mb-2 tracking-tighter">
                      <span className="text-slate-300 group-hover:text-white transition-colors">{zone.name}</span>
                      <span className="text-white font-mono opacity-80">{zone.occupancy} / {(zone.capacity || 100)}</span>
                    </div>
                    <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                        style={{ 
                          width: `${Math.min((zone.occupancy / (zone.capacity || 100)) * 100, 100)}%`,
                          backgroundColor: config.color 
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

// ==========================================
// 5. AUDIT LOGS (RESTORED)
// ==========================================
const AuditLogs = ({ events }: { events: any[] }) => {
  const [selectedType, setSelectedType] = useState('granted');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tactical Temporal State
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('00:00');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [endTime, setEndTime] = useState('23:59');

  const filteredLogs = events.filter((e: any) => {
    const isTypeMatch = e.status.toLowerCase() === selectedType;
    
    // Range Intersection Logic
    const eventTime = new Date(e.createdAt).getTime();
    const startRange = new Date(`${startDate}T${startTime}`).getTime();
    const endRange = new Date(`${endDate}T${endTime}`).getTime();
    const isWithinRange = eventTime >= startRange && eventTime <= endRange;
    
    const query = searchQuery.toLowerCase();
    const isSearchMatch = 
      (e.user?.name || '').toLowerCase().includes(query) ||
      (e.zone?.name || '').toLowerCase().includes(query) ||
      (e.reason || '').toLowerCase().includes(query);
    return isTypeMatch && isWithinRange && isSearchMatch;
  });

  const countForRange = events.filter((e: any) => {
    const eventTime = new Date(e.createdAt).getTime();
    const startRange = new Date(`${startDate}T${startTime}`).getTime();
    const endRange = new Date(`${endDate}T${endTime}`).getTime();
    return eventTime >= startRange && eventTime <= endRange && e.status.toLowerCase() === selectedType;
  }).length;

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }).replace(/\//g, '-');

  return (
    <div className="p-10 animate-in fade-in duration-500 h-full flex flex-col max-w-7xl mx-auto w-full">
      {/* Tactical Header */}
      <header className="flex justify-between items-start mb-10 shrink-0">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">Access Logs</h1>
          <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] mt-2">Historical Operational Ledger</p>
        </div>
        
        {/* Tactical Temporal Command HUD */}
        <div className="flex items-center gap-4 bg-white/[0.03] border border-white/10 rounded-[32px] p-2 pr-6 backdrop-blur-xl shadow-2xl relative shadow-blue-500/5">
          <div className="flex items-center gap-2">
             <div className="relative group/start px-5 py-3 bg-white/[0.02] border border-white/5 rounded-[24px] flex items-center gap-3 hover:bg-white/[0.04] transition-all">
               <div className="flex items-center gap-3">
                  <Calendar size={14} className="text-blue-500/50" />
                  <span className="text-xs font-black text-white italic tracking-tight">{formatDate(startDate)}</span>
               </div>
               <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>

            <div className="w-6 h-[1px] bg-white/10" />
            <div className="relative group/end px-5 py-3 bg-white/[0.02] border border-white/5 rounded-[24px] flex items-center gap-3 hover:bg-white/[0.04] transition-all">
               <div className="flex items-center gap-3">
                  <Calendar size={14} className="text-emerald-500/50" />
                  <span className="text-xs font-black text-white italic tracking-tight">{formatDate(endDate)}</span>
               </div>
               <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>
          
          <div className="ml-4 h-8 w-[1px] bg-white/10" />
          <button className="ml-4 p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-500/10">
             <RefreshCw size={18} className="animate-in spin-in duration-700" onClick={() => window.location.reload()} />
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        <button 
          onClick={() => setSelectedType('granted')}
          className={`flex items-center gap-6 p-6 rounded-[32px] border transition-all relative overflow-hidden group ${
            selectedType === 'granted' ? 'bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/20' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
          }`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
            selectedType === 'granted' ? 'bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)]' : 'bg-white/5 text-slate-600'
          }`}>
            <CheckCircle2 size={28} />
          </div>
          <div className="text-left relative z-10">
            <h3 className={`text-sm font-black uppercase tracking-[0.2em] mb-1 ${selectedType === 'granted' ? 'text-emerald-400' : 'text-slate-400'}`}>Access Granted</h3>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Attendance & Entry Tracking</p>
          </div>
          {selectedType === 'granted' && (
            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
          )}
        </button>

        <button 
          onClick={() => setSelectedType('denied')}
          className={`flex items-center gap-6 p-6 rounded-[32px] border transition-all relative overflow-hidden group ${
            selectedType === 'denied' ? 'bg-red-500/10 border-red-500/40 ring-1 ring-red-500/20' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
          }`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
            selectedType === 'denied' ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'bg-white/5 text-slate-600'
          }`}>
            <XCircle size={28} />
          </div>
          <div className="text-left relative z-10">
            <h3 className={`text-sm font-black uppercase tracking-[0.2em] mb-1 ${selectedType === 'denied' ? 'text-red-400' : 'text-slate-400'}`}>Access Denied</h3>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Threat Investigation</p>
          </div>
          {selectedType === 'denied' && (
            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" />
          )}
        </button>
      </div>

      {/* Metrics & Filters */}
      <div className="flex justify-between items-center mb-8 shrink-0 px-2">
        <p className="text-xl font-black text-white italic tracking-tighter">
          <span className={selectedType === 'granted' ? 'text-emerald-500' : 'text-red-500'}>{countForRange}</span> {selectedType} events from {formatDate(startDate)} {startTime} to {formatDate(endDate)} {endTime}
        </p>
        
        <div className="flex gap-4">
          <div className="relative group w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search name, location, reason"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm text-white placeholder:text-slate-700 outline-none focus:border-blue-500/50 transition-all font-bold"
            />
          </div>
          <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
            <Download size={16} className="text-slate-500" /> Export
          </button>
        </div>
      </div>

      {/* Main Logistics Hub */}
      <div className="flex-1 bg-[#0b1424]/40 border border-white/10 rounded-[48px] overflow-hidden backdrop-blur-xl flex flex-col shadow-2xl relative shadow-emerald-500/5">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4" />
        
        <header className="px-10 py-6 border-b border-white/[0.05] flex justify-between items-center bg-white/[0.02] relative z-20">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${selectedType === 'granted' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-pulse'}`} />
            <span className={`text-[11px] font-black uppercase tracking-[0.3em] ${selectedType === 'granted' ? 'text-emerald-400' : 'text-red-400'}`}>
              {selectedType === 'granted' ? 'Granted Entries' : 'Denied Entries'}
            </span>
          </div>
          <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Page 1 of 1</span>
        </header>

        <div className="overflow-x-auto flex-1 relative z-10 scrollbar-hide">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-slate-600 uppercase tracking-[0.2em] border-b border-white/[0.03]">
                <th className="px-10 py-6 font-black w-1/4"><div className="flex items-center gap-2"><Clock size={12} /> Time</div></th>
                <th className="px-10 py-6 font-black w-1/4">User</th>
                <th className="px-10 py-6 font-black w-1/4">Location</th>
                <th className="px-10 py-6 font-black w-1/4">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center opacity-30">
                     <div className="relative inline-block mb-8">
                       <CheckCircle2 size={80} className={`mx-auto ${selectedType === 'granted' ? 'text-emerald-500' : 'text-red-500'} opacity-20`} />
                       <div className="absolute inset-0 flex items-center justify-center translate-y-1">
                          <Activity size={32} className="text-white/40" />
                       </div>
                     </div>
                     <h4 className="text-xl font-black text-white italic tracking-tight mb-2">No {selectedType} events in range</h4>
                     <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600">Adjust temporal bounds or search parameters.</p>
                  </td>
                </tr>
              ) : filteredLogs.map((log: any) => (
                <tr key={log.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-10 py-6">
                    <span className="text-[11px] font-mono text-slate-400 font-bold group-hover:text-white transition-colors">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-slate-400 group-hover:border-blue-500/50 transition-all">
                        {(log.user?.name || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-black text-white group-hover:text-blue-400 transition-colors">{log.user?.name || 'Unknown User'}</p>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{log.user?.email || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">{log.zone?.name || 'Unknown Sector'}</span>
                      <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">{log.zone?.id || 'EXTERNAL'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/[0.05] rounded-lg">
                      <Fingerprint size={12} className="text-slate-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-300 transition-colors">NFC / BIOMETRIC</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


// --- SHARED ATOMIC COMPONENTS ---

// ==========================================
// 7. SIMULATOR VIEW (NEW)
// ==========================================
const SimulatorView = () => (
   <div className="p-10 animate-in fade-in duration-300 max-w-6xl mx-auto w-full">
      <header className="mb-10">
         <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Access Simulator</h1>
         <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-black">Test security logic and hardware triggers</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-slate-900/40 border border-slate-800 rounded-[40px] p-10 flex flex-col items-center justify-center text-center group hover:border-blue-500/30 transition-all">
            <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform"><Cpu size={32} /></div>
            <h3 className="text-lg font-black text-white uppercase mb-2">Simulate Entry Scan</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed mb-8">Trigger a virtual QR scan to test zone-grant/deny logic without physical hardware.</p>
            <button className="px-8 py-3 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20">Launch Terminal</button>
         </div>
         <div className="bg-slate-900/40 border border-slate-800 rounded-[40px] p-10 flex flex-col items-center justify-center text-center group hover:border-red-500/30 transition-all">
            <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center text-red-500 mb-6 group-hover:scale-110 transition-transform"><AlertTriangle size={32} /></div>
            <h3 className="text-lg font-black text-white uppercase mb-2">Trigger Alarm Event</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed mb-8">Simulate a forced entry or hardware tamper event to verify notification stacks.</p>
            <button className="px-8 py-3 bg-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-600/20">Broadcast Alert</button>
         </div>
      </div>
   </div>
);

// ==========================================
// 8. GENERAL SETTINGS (NEW)
// ==========================================
const GeneralSettings = () => (
   <div className="p-10 animate-in fade-in duration-300 max-w-4xl mx-auto w-full">
      <header className="mb-10">
         <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">System Settings</h1>
         <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-black">Global Platform Preferences</p>
      </header>
      <div className="space-y-6">
         <div className="bg-slate-900/40 border border-slate-800 rounded-[40px] p-10 shadow-xl">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2"><Key size={16} className="text-blue-500"/> Governance Controls</h3>
            <div className="space-y-6">
               <div className="flex justify-between items-center pb-6 border-b border-slate-800/50">
                  <div>
                    <p className="text-sm font-bold text-white mb-1">Audit Log Persistence</p>
                    <p className="text-[10px] font-medium text-slate-500">Currently set to 365 days (Enterprise Plan).</p>
                  </div>
                  <button className="px-4 py-2 bg-slate-950 border border-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Adjust</button>
               </div>
               <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-white mb-1">API Webhooks</p>
                    <p className="text-[10px] font-medium text-slate-500">Send real-time events to your internal server.</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-xl text-[10px] font-black uppercase tracking-widest">Configure</button>
               </div>
            </div>
         </div>
      </div>
   </div>
);

const MyProfile = () => {
  const { user, logout } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  
  const dummyTrafficData = [
    { time: '00:00', value: 45 }, { time: '04:00', value: 30 },
    { time: '08:00', value: 85 }, { time: '12:00', value: 120 },
    { time: '16:00', value: 95 }, { time: '20:00', value: 65 },
    { time: '23:59', value: 50 }
  ];

  return (
    <div className="p-10 animate-in fade-in duration-500 max-w-7xl mx-auto w-full pb-32">
      {/* --- STRATEGIC HEADER --- */}
      <header className="mb-10 flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">Tenant Command Center</h1>
          <div className="flex items-center gap-2 text-slate-500">
            <Building2 size={14} className="text-blue-500/50" />
            <p className="text-[11px] font-black uppercase tracking-[0.2em]">Organizational Identity Portal • Infrastructure Node #24</p>
          </div>
        </div>
        <button 
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95 group"
        >
          <Edit2 size={14} className="group-hover:rotate-12 transition-transform" />
          Edit Profile
        </button>
      </header>

      {/* --- CORE IDENTITY MATRIX --- */}
      <div className="bg-[#0b1424]/40 border border-white/5 rounded-[40px] p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4" />
        
        <div className="flex items-center gap-10 mb-12 relative z-10 border-b border-white/[0.03] pb-10">
          <div className="w-32 h-32 rounded-[32px] bg-blue-600 flex items-center justify-center text-white text-6xl font-black shadow-2xl shadow-blue-600/30">
            {user?.name?.[0].toUpperCase() || 'C'}
          </div>
          <div className="space-y-4">
            <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
              {user?.org || 'CIT COLLEGE'}
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Active</span>
              </div>
              <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Quantum Enterprise</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
          <div className="space-y-10">
            <div className="group">
              <div className="flex items-center gap-2 text-blue-500 mb-3">
                <Activity size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Mission Profile</span>
              </div>
              <p className="text-sm font-bold text-slate-400 leading-relaxed italic">
                Premier Strategic Infrastructure Node for Digital Sovereignty & Identity Governance. Specializing in High-Fidelity Knowledge Synthesis & Access Provisioning for Distributed Research Frameworks.
              </p>
            </div>
            
            <div className="group">
              <div className="flex items-center gap-2 text-blue-500 mb-3">
                <MapPin size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Global Headquarters</span>
              </div>
              <p className="text-lg font-black text-white uppercase tracking-tight">
                Silicon Valley Sector 7, Palo Alto, CA.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 hover:bg-white/[0.04] transition-all group">
              <div className="flex items-center gap-3 text-slate-500 mb-4 group-hover:text-blue-500 transition-colors">
                <Globe size={20} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Official Website</span>
              </div>
              <p className="text-xl font-black text-white uppercase tracking-tight mb-1">https://node.cit.edu</p>
              <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Public Endpoint</p>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 hover:bg-white/[0.04] transition-all group">
              <div className="flex items-center gap-3 text-slate-500 mb-4 group-hover:text-blue-500 transition-colors">
                <Shield size={20} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Technical Node Signature</span>
              </div>
              <p className="text-xl font-black text-white uppercase tracking-tight mb-1">{user?.slug || 'CIT'}</p>
              <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Core Identifier</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- INFRASTRUCTURE VITALITY & PERSONNEL HUB --- */}
      <div className="grid grid-cols-12 gap-8 mb-8">
        <div className="col-span-12 lg:col-span-8 bg-[#0b1424]/40 border border-white/5 rounded-[40px] p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 border border-blue-500/20"><Zap size={20} /></div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Identity Verification Streams</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">P99 Throughput</p>
                <p className="text-lg font-black text-blue-400 font-mono tracking-tighter">1.2k ops/s</p>
              </div>
            </div>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dummyTrafficData}>
                <defs>
                  <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTraffic)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-[#0b1424]/40 border border-white/5 rounded-[40px] p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20"><Users size={20} /></div>
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Personnel Hub</h3>
                </div>
                <span className="text-2xl font-black text-white italic tracking-tighter">1,248</span>
             </div>
             <div className="space-y-4">
                <div>
                   <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1.5">
                      <span className="text-slate-600">Active Operatives</span>
                      <span className="text-emerald-500">92%</span>
                   </div>
                   <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: '92%' }} />
                   </div>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-4">
                   <div className="text-center">
                      <p className="text-sm font-black text-white">42</p>
                      <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Level 1</p>
                   </div>
                   <div className="text-center">
                      <p className="text-sm font-black text-white">1,080</p>
                      <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Level 2</p>
                   </div>
                   <div className="text-center">
                      <p className="text-sm font-black text-blue-500">126</p>
                      <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Level 3</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-[#0b1424]/40 border border-white/5 rounded-[32px] p-8 shadow-2xl backdrop-blur-xl group hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Financial Nexus</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Calendar size={14} />
              </div>
            </div>
            <p className="text-xl font-black text-white uppercase italic tracking-tighter">Oct 12, 2026</p>
            <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest mt-1">Next Billing Cycle</p>
          </div>
        </div>
      </div>

      {/* --- GOVERNANCE METRICS HUB --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-[#0b1424]/40 border border-white/5 rounded-[32px] p-8 group hover:bg-[#0b1424]/60 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Admin Contact</span>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Mail size={22} />
            </div>
          </div>
          <p className="text-lg font-black text-white lowercase tracking-tight mb-1">{user?.email || 'admin@cit.edu'}</p>
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Primary Authority</p>
        </div>

        <div className="bg-[#0b1424]/40 border border-white/5 rounded-[32px] p-8 group hover:bg-[#0b1424]/60 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Support Line</span>
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400">
              <Phone size={22} />
            </div>
          </div>
          <p className="text-lg font-black text-white uppercase tracking-tight mb-1">Emergency Only</p>
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Global Assistance</p>
        </div>

        <div className="bg-[#0b1424]/40 border border-white/5 rounded-[32px] p-8 group hover:bg-[#0b1424]/60 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">License Status</span>
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-600">
              <Key size={22} />
            </div>
          </div>
          <p className="text-lg font-black text-white uppercase tracking-tight mb-1">Continuous</p>
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Next Sync Window</p>
        </div>
      </div>

      {/* Edit Profile Modal Mock */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-lg animate-in fade-in duration-200">
           <div className="bg-[#0b1424] border border-white/10 rounded-[40px] p-10 w-[480px] shadow-2xl animate-in zoom-in-95 duration-300">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-8">Edit Identity</h2>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2 block">Operative Name</label>
                    <input type="text" defaultValue={user?.name} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-blue-500/50 transition-all font-bold" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2 block">Secure Email</label>
                    <input type="email" defaultValue={user?.email} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-blue-500/50 transition-all font-bold" />
                 </div>
                 <div className="grid grid-cols-2 gap-4 pt-4">
                    <button onClick={() => setIsEditing(false)} className="w-full py-3.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest">Cancel</button>
                    <button onClick={() => setIsEditing(false)} className="w-full py-3.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20">Update Node</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const ProfileField = ({ icon, label, value, isMono = false }: any) => (
  <div className="flex items-start gap-4 group">
    <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-slate-600 group-hover:text-blue-400 group-hover:border-blue-500/20 transition-all shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-sm text-slate-200 truncate ${isMono ? 'font-mono' : 'font-bold'}`}>{value}</p>
    </div>
  </div>
);

const NavItem = ({ icon, label, active = false, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
    active ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
  }`}>
    <span className={active ? 'text-white' : 'text-slate-600 group-hover:text-blue-400 transition-colors'}>{icon}</span>
    <span className="text-sm font-bold tracking-tight">{label}</span>
  </button>
);

const Blink = ({ color = "#22c55e" }) => (
  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color, animation: 'blink 2s ease-in-out infinite' }} />
);

const Sparkline = ({ data, color, height = 36 }: any) => {
  const max = Math.max(...data);
  const w = 120, h = height;
  const pts = data.map((v: any, i: any) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height, display: "block" }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#sg-${color.replace("#","")})`} />
    </svg>
  );
};

const HourlyChart = ({ data }: any) => {
  const maxG = Math.max(...data.map((d: any) => d.granted));
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d: any, i: any) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="w-full flex flex-col justify-end h-16 gap-[1px]">
            {d.denied > 0 && <div className="bg-red-500 rounded-t-[1px] opacity-70 group-hover:opacity-100 transition-all" style={{ height: `${Math.max(10, (d.denied / maxG) * 100)}%` }} />}
            <div className="bg-blue-500 rounded-t-[1px] opacity-40 group-hover:opacity-100 transition-all" style={{ height: `${(d.granted / maxG) * 100}%` }} />
          </div>
          <span className="text-[7px] text-slate-600 font-mono font-bold">{d.h}</span>
        </div>
      ))}
    </div>
  );
};

const LiveCamera = ({ currentTime }: any) => {
  const [scanY, setScanY] = useState(20);
  useEffect(() => {
    const t = setInterval(() => setScanY(y => y > 90 ? 10 : y + 0.8), 40);
    return () => clearInterval(t);
  }, []);
  
  return (
    <div className="relative w-full h-full bg-[#070d18] overflow-hidden">
      {/* HUD overlays */}
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        <div className="bg-black/60 border border-white/10 rounded px-2 py-0.5 flex items-center gap-1.5">
           <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
           <span className="text-[9px] font-mono text-red-500 font-black">REC</span>
        </div>
        <div className="bg-black/60 border border-white/10 rounded px-2 py-0.5">
           <span className="text-[9px] font-mono text-white/40 font-black tracking-widest">1080p 60FPS</span>
        </div>
      </div>

      {/* Sync Status */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded px-2 py-0.5">
         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
         <span className="text-[9px] font-mono text-emerald-400 font-black">SYNC_LIVE</span>
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(14,165,233,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Scan line */}
      <div className="absolute left-0 right-0 h-0.5 bg-blue-500/60 shadow-[0_0_15px_#3b82f6] transition-all duration-75 ease-linear pointer-events-none" style={{ top: `${scanY}%` }} />

      {/* Detection Box */}
      <div className="absolute top-1/4 left-1/3 w-32 h-44 border border-blue-500/50 flex flex-col justify-between p-1">
         <div className="flex justify-between w-full h-2 uppercase">
            <div className="w-2 h-2 border-t-2 border-l-2 border-blue-400" />
            <div className="w-2 h-2 border-t-2 border-r-2 border-blue-400" />
         </div>
         <div className="absolute -top-4 left-0 bg-blue-500/20 border border-blue-500/40 px-1 rounded">
            <span className="text-[7px] font-mono text-blue-400 font-black tracking-widest">SCANNING_ZONE_A</span>
         </div>
         <div className="flex justify-between w-full h-2 uppercase">
            <div className="w-2 h-2 border-b-2 border-l-2 border-blue-400" />
            <div className="w-2 h-2 border-b-2 border-r-2 border-blue-400" />
         </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-4 left-4 z-10">
        <span className="text-[9px] font-mono text-white/20 font-black tracking-[0.2em] uppercase italic">
          MAIN GATE · CAM-01 · {currentTime}
        </span>
      </div>
    </div>
  );
};

const FeedItem = ({ name, status, loc, time, reason, isError }: any) => (
  <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-colors ${isError ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-950 border-slate-800/50'}`}>
     <div className="relative">
       <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-black text-slate-400 shadow-inner">{name[0]}</div>
       <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#020617] ${isError ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
          {isError ? <XCircle size={10} /> : <CheckCircle2 size={10} />}
       </div>
     </div>
     <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-white truncate">{name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
           <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest truncate">{loc}</span>
           {isError && <span className="text-[8px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded uppercase font-bold truncate">{reason}</span>}
        </div>
     </div>
     <span className="text-[9px] font-mono text-slate-600">{time}</span>
  </div>
);

const GeospatialFeedItem = ({ name, action, loc, time, type }: any) => {
  const isDenied = type === "denied";
  const isAlert = type === "alert";
  const isEntry = type === "entry";
  
  return (
    <div className={`p-3 rounded-2xl border flex items-center gap-4 bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.05] transition-all`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 border-black/40 shadow-inner ${
        isDenied ? "bg-red-500/10 text-red-500" : 
        isAlert ? "bg-amber-500/10 text-amber-500" : 
        isEntry ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 text-slate-400"
      }`}>
        {isDenied ? <XCircle size={20} /> : isAlert ? <AlertTriangle size={18} /> : 
         isEntry ? <Zap size={18} className="rotate-45" /> : <div className="w-2 h-2 rounded-full border-2 border-current" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black text-white truncate">{name}</p>
        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest truncate">
          <span className={isDenied ? "text-red-500" : isAlert ? "text-amber-500" : isEntry ? "text-emerald-500" : "text-slate-400"}>
            {action}
          </span> · {loc}
        </p>
      </div>
      <span className="text-[9px] font-mono text-slate-700 font-black">{time}</span>
    </div>
  );
};

const TacticalMapNode = ({ name, id, pos, occupancy, capacity, color, alert, icon, onClick }: any) => {
  return (
    <div className="absolute transition-all duration-500" style={{ ...pos }} onClick={onClick}>
      <div className={`w-[130px] bg-[#0b1424]/95 border-2 rounded-[24px] p-4 shadow-2xl backdrop-blur-xl relative group transition-all hover:scale-110 active:scale-95 cursor-pointer ${
        alert ? "border-red-500/40 bg-red-950/30" : "border-white/5 hover:border-blue-500/30"
      }`}>
        {/* Occupancy HUD */}
        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-xl bg-black/80 border border-white/10 flex items-center justify-center shadow-2xl z-20">
          <span className="text-[10px] font-black font-mono" style={{ color }}>{occupancy}</span>
        </div>
        
        {/* Header Icon + ID */}
        <div className="flex items-center gap-2 mb-3">
           <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 group-hover:text-blue-400 transition-colors">
              {icon || <div className="w-1 h-1 rounded-full bg-current" />}
           </div>
           <div className="flex-1 min-w-0">
              <h4 className="text-[10px] font-black text-white uppercase tracking-tight truncate leading-none mb-0.5">{name}</h4>
              <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest truncate">{id}</p>
           </div>
        </div>

        {/* Vitality Bar */}
        <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden relative border border-white/5 mb-2">
          <div 
             className="h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.1)]" 
             style={{ width: `${Math.min((occupancy / (capacity || 100)) * 100, 100)}%`, backgroundColor: color }} 
          />
        </div>

        <div className="flex justify-between items-center px-0.5">
           <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest">Load_Factor</span>
           <span className="text-[7px] font-mono text-slate-500">{Math.round((occupancy / (capacity || 100)) * 100)}%</span>
        </div>

        {alert && (
          <div className="absolute inset-0 border-2 border-red-500/40 rounded-[24px] animate-pulse pointer-events-none shadow-[inset_0_0_20px_rgba(239,68,68,0.2)]" />
        )}
      </div>
    </div>
  );
};

const IdentityFocus = ({ user, onBack, events }: any) => {
  if (!user) return null;
  const userLogs = events.filter((e: any) => e.userId === user.id).slice(0, 5);
  
  return (
    <div className="p-16 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
       <button onClick={onBack} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-slate-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest mb-12">
          <ArrowLeft size={16} /> Return to Directory
       </button>
 
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-gradient-to-br from-blue-600/10 to-blue-900/10 border border-blue-500/20 rounded-[48px] p-12 relative overflow-hidden backdrop-blur-xl">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
             
             <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-32 h-32 rounded-[32px] bg-[#0f172a] border-4 border-blue-500 flex items-center justify-center text-4xl font-black text-blue-500 mb-8 shadow-[0_0_50px_rgba(59,130,246,0.3)]">
                   {(user.name || 'U')[0].toUpperCase()}
                </div>
                
                <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">{user.name}</h2>
                <p className="text-[11px] text-blue-400 font-black uppercase tracking-[0.3em] mb-10">{user.dept || 'Staff'} Division</p>
                
                <div className="grid grid-cols-2 gap-4 w-full">
                   <div className="bg-black/20 border border-white/5 rounded-3xl p-6 text-left">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Internal UID</p>
                      <p className="text-xs font-mono text-slate-300 truncate">{user.id}</p>
                   </div>
                   <div className="bg-black/20 border border-white/5 rounded-3xl p-6 text-left">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Verified Contact</p>
                      <p className="text-xs font-bold text-slate-300 truncate">{user.email}</p>
                   </div>
                </div>
 
                <div className="mt-10 flex gap-4">
                   <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Active</span>
                   </div>
                   <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Sync Enabled</span>
                   </div>
                </div>
             </div>
          </div>
 
          <div className="bg-white/[0.02] border border-white/5 rounded-[48px] p-10 flex flex-col min-h-[400px]">
             <header className="flex items-center gap-3 mb-8">
                <Clock size={18} className="text-slate-500" />
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Recent Operational Activity</h3>
             </header>
 
             <div className="flex-1 space-y-4">
                {userLogs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-6">
                    <Activity size={32} className="mb-4" />
                    <p className="text-[9px] font-black uppercase tracking-widest">No recent audit trails detected for this operative</p>
                  </div>
                ) : userLogs.map((log: any) => (
                  <div key={log.id} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl group hover:bg-white/[0.05] transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${log.status.toLowerCase() === 'granted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>{log.status}</span>
                      <span className="text-[8px] font-mono text-slate-700">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[10px] font-bold text-white mb-0.5">{log.zone?.name || 'ZONE_NULL'}</p>
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Scan Authorized</p>
                  </div>
                ))}
             </div>
 
             <button className="mt-8 w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black text-slate-500 hover:text-white hover:bg-white/10 transition-all uppercase tracking-[0.2em]">View Full Chain →</button>
          </div>
       </div>
    </div>
  );
};
function HUDSelect({ value, icon, options, onSelect }: any) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-white text-sm flex items-center gap-3 transition-all hover:bg-white/[0.05]"
      >
        <div className="text-slate-600">{icon}</div>
        <span className="flex-1 text-left font-bold">{value}</span>
        <div className={`text-slate-600 transition-transform ${open ? 'rotate-180' : ''}`}><ChevronDown size={14} /></div>
      </button>

      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#0d131f] border border-white/10 rounded-3xl overflow-hidden z-[100] shadow-2xl">
          {options.map((opt: any) => (
            <button 
              key={opt.id || opt}
              onClick={() => { onSelect(opt); setOpen(false); }}
              className="w-full px-6 py-4 border-b border-white/[0.03] text-sm text-white font-bold text-left hover:bg-white/[0.05] transition-colors"
            >
              {opt.name || opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
