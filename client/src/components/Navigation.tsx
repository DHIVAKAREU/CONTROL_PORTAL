'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  History, 
  QrCode, 
  LogOut, 
  Shield,
  Activity,
  Zap,
  Globe,
  Server,
  CreditCard,
  Lock
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '../lib/utils';

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout, impersonatingFrom } = useAuthStore();

  const getNavItems = () => {
    // Platform Admin (Superior Admin) Views
    if (user?.role === 'PLATFORM_ADMIN') {
      return [
        { id: 'platform', label: 'Platform Hub', icon: Shield, href: '/platform' },
      ];
    }

    // Org Admin & User Tactical Views
    const baseItems = [
      { id: 'pass', label: 'Digital Pass', icon: QrCode, href: '/pass' },
      { id: 'command', label: 'Tactical Command', icon: Zap, href: '/command' },
      { id: 'users', label: 'Users', icon: Users, href: '/users' },
      { id: 'zones', label: 'Zones', icon: MapPin, href: '/zones' },
      { id: 'logs', label: 'Activity Logs', icon: History, href: '/logs' },
      { id: 'scanner', label: 'Scanner', icon: QrCode, href: '/scanner' },
    ];

    if (user?.role === 'USER') {
      return baseItems.filter(item => item.id !== 'users');
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <div className="w-64 bg-[#080a0f] border-r border-white/5 flex flex-col h-screen">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-[0_0_15px_-5px_#3b82f6]">SA</div>
          <span className="font-black tracking-tight text-lg text-white">SmartAccess</span>
        </div>
        <div className="px-3 py-2 bg-[#121520] border border-white/5 rounded-md flex items-center gap-2">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full shadow-[0_0_8px]",
            user?.role === 'PLATFORM_ADMIN' ? "bg-indigo-500 shadow-indigo-500" : "bg-emerald-500 shadow-emerald-500"
          )} />
          <span className="text-[10px] font-mono text-gray-400 truncate uppercase tracking-tighter font-bold">
            {user?.role === 'PLATFORM_ADMIN' ? 'Superior_Admin' : (user?.org || 'Platform')}
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2 font-mono">
          {user?.role === 'PLATFORM_ADMIN' ? 'Platform Governance' : 'Operations'}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-all group",
                isActive 
                  ? "bg-blue-600/10 text-blue-500 border-l-2 border-blue-600 pl-2.5" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-blue-500" : "text-gray-500 group-hover:text-gray-300")} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-4">
        {user?.isImpersonating && (
           <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] text-amber-500 font-bold uppercase tracking-tighter">
             Impersonating {user.slug}
           </div>
        )}
        <div className="flex items-center gap-3 px-2">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs",
            user?.role === 'PLATFORM_ADMIN' ? "bg-indigo-600 text-white shadow-[0_0_10px_-4px_#4f46e5]" : "bg-blue-500/20 text-blue-400"
          )}>
            {user?.name?.[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">{user?.name}</div>
            <div className="text-[10px] text-gray-500 truncate font-mono uppercase tracking-tighter leading-none">{user?.role}</div>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit System</span>
        </button>
      </div>
    </div>
  );
};

export const Topbar = ({ title }: { title: string }) => {
  return (
    <div className="h-14 bg-[#080a0f] border-b border-white/5 flex items-center justify-between px-6">
      <h1 className="text-sm font-black tracking-tight uppercase tracking-widest font-mono">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="px-3 py-1 rounded bg-[#121520] border border-white/5 text-[10px] font-mono text-gray-500">
          SEC_STATUS: <span className="text-emerald-500 font-bold">OPTIMAL</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-[10px] font-mono text-gray-400 uppercase">Live Stream</span>
        </div>
      </div>
    </div>
  );
};
