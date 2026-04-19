'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, Suspense, useState } from "react";

// Components
import Dashboard from './components/Dashboard';
import MyPass from './components/MyPass';
import Profile from './components/Profile';
import Timeline from './components/Timeline';
import AreaAccess from './components/AreaAccess';
import Settings from './components/Settings';

// Mock Data for Header/Sidebar
import { NOTIFICATIONS } from './components/mockData';

export default function UserPortal() {
  return (
    <Suspense fallback={<div style={{ background: "#05080c", height: "100vh" }} />}>
       <UserPortalContent />
    </Suspense>
  );
}

function UserPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const { user, _hasHydrated, logout } = useAuthStore();
  const initialPage = searchParams.get('tab') || 'dashboard';
  const [page, setPage] = useState(initialPage);
  const [notifOpen, setNotifOpen] = useState(false);
  const unread = NOTIFICATIONS.filter(n => !n.read).length;

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', page);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [page, pathname, router, searchParams, _hasHydrated, user]);

  if (!_hasHydrated) return <div style={{ background: "#05080c", height: "100vh" }} />;

  const handleLogout = () => { logout(); router.push('/login'); };

  const PAGE_CFG: any = {
    dashboard: { label: "Dashboard", icon: "⊞" },
    pass: { label: "My Pass", icon: "◈" },
    profile: { label: "My Profile", icon: "◷" },
    timeline: { label: "Timeline", icon: "≡" },
    zones: { label: "Areas", icon: "◎" },
    settings: { label: "Settings", icon: "⬡" },
  };

  const PAGE_MAP: any = {
    dashboard: <Dashboard onNav={setPage} user={user} />,
    pass: <MyPass user={user} />,
    profile: <Profile user={user} />,
    timeline: <Timeline />,
    zones: <AreaAccess />,
    settings: <Settings user={user} />,
  };

  const TITLES: any = { dashboard: "Operational Dashboard", pass: "Digital Personnel Pass", profile: "Personnel Identity", timeline: "Activity Log", zones: "Area Access Control", settings: "Account Governance" };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#05080c", fontFamily: "'Inter',system-ui,sans-serif", color: "#fff", overflow: "hidden" }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px;}
      `}</style>

      <aside style={{ width: 220, background: "#03060c", borderRight: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "24px 20px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#3b82f6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900 }}>⬡</div>
            <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: "-0.04em" }}>SMART<span style={{ color: "#3b82f6" }}>ACCESS</span></span>
          </div>
        </div>

        <nav style={{ padding: "10px 12px", flex: 1 }}>
          {Object.entries(PAGE_CFG).map(([id, cfg]: any) => (
            <button key={id} onClick={() => setPage(id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: "none", cursor: "pointer", marginBottom: 4, background: page === id ? "rgba(59,130,246,0.12)" : "transparent", color: page === id ? "#3b82f6" : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: page === id ? 700 : 500, transition: ".2s" }}>
              <span style={{ fontSize: 15 }}>{cfg.icon}</span>{cfg.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ padding: "14px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#3b82f6" }}>{user?.name?.[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name}</p>
              <p style={{ margin: "2px 0 0", fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{user?.role}</p>
            </div>
          </div>

          <button 
            onClick={handleLogout} 
            style={{ 
              width: "100%", 
              padding: "12px", 
              background: "rgba(255,255,255,0.02)", 
              border: "1px solid rgba(255,255,255,0.06)", 
              borderRadius: 12, 
              color: "#fff", 
              fontSize: 12, 
              fontWeight: 800, 
              letterSpacing: "0.08em", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: 10, 
              cursor: "pointer",
              transition: ".2s"
            }}
            onMouseOver={(e: any) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            onMouseOut={(e: any) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
          >
            <span style={{ fontSize: 16, opacity: 0.7 }}>[→</span> SIGN OUT
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ padding: "18px 28px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(3,6,12,0.8)", backdropFilter: "blur(10px)", zIndex: 10 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900, letterSpacing: "-0.03em" }}>{TITLES[page]}</h1>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Authenticated Portal Hub</p>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", position: "relative" }}>
            <button onClick={() => setNotifOpen(!notifOpen)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, width: 38, height: 38, color: "rgba(255,255,255,0.7)", fontSize: 16, cursor: "pointer", position: "relative" }}>
              🔔
              {unread > 0 && <div style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", border: "2px solid #03060c" }} />}
            </button>
            {notifOpen && (
              <div style={{ position: "absolute", top: 48, right: 0, width: 300, background: "#0d1524", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, zIndex: 100, overflow: "hidden" }}>
                 <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}><p style={{ margin: 0, fontSize: 12, fontWeight: 800 }}>Security Alerts</p></div>
                 {NOTIFICATIONS.map(n => (
                   <div key={n.id} style={{ padding: "12px 16px", display: "flex", gap: 10, background: n.read ? "transparent" : "rgba(59,130,246,0.05)", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <span>{n.icon}</span>
                      <div>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: n.read ? 500 : 700 }}>{n.title}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{n.sub}</p>
                      </div>
                   </div>
                 ))}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 20, padding: "6px 14px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "blink 2s infinite" }} />
              <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 800, letterSpacing: "0.05em" }}>SYSTEM SECURE</span>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflow: "auto", padding: "26px 30px" }}>
          {PAGE_MAP[page]}
        </main>
      </div>
    </div>
  );
}
