'use client';

import React, { useEffect, useState } from 'react';
import { ShieldOff, Power, RefreshCw, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const [status, setStatus] = useState('DE_AUTHENTICATING');

  useEffect(() => {
    logout();
    router.push('/login');
  }, [logout, router]);

  return (
    <div className="h-screen bg-[#020617] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)]" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />

      {/* Main Content Card */}
      <div className="relative z-10 w-full max-w-md px-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="mb-10 inline-flex items-center justify-center">
          <div className={`p-6 rounded-[32px] border-2 transition-all duration-700 ${status === 'DE_AUTHENTICATING' ? 'bg-blue-500/10 border-blue-500/40 animate-pulse' : 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.2)]'}`}>
            {status === 'DE_AUTHENTICATING' ? (
              <RefreshCw size={48} className="text-blue-400 animate-spin" style={{ animationDuration: '3s' }} />
            ) : (
              <Power size={48} className="text-emerald-400" />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            {status === 'DE_AUTHENTICATING' ? 'Protocol: Terminating...' : 'Mission Terminated'}
          </h1>
          
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] leading-relaxed">
              {status === 'DE_AUTHENTICATING' 
                ? 'Scrubbing secure session tokens and re-initializing environment...' 
                : 'All secure_core shards have been successfully disconnected.'}
            </p>
            
            <div className="flex items-center justify-center gap-3">
              <div className={`h-1 flex-1 rounded-full transition-all duration-1000 ${status === 'SECURE_TERMINATED' ? 'bg-emerald-500/20' : 'bg-blue-500/20'}`} />
              <ShieldOff size={14} className={status === 'SECURE_TERMINATED' ? 'text-emerald-500' : 'text-blue-500'} />
              <div className={`h-1 flex-1 rounded-full transition-all duration-1000 ${status === 'SECURE_TERMINATED' ? 'bg-emerald-500/20' : 'bg-blue-500/20'}`} />
            </div>
          </div>
        </div>

        {status === 'SECURE_TERMINATED' && (
          <div className="mt-12 animate-in fade-in zoom-in-95 duration-500 delay-300 fill-mode-both">
            <button
              onClick={() => router.push('/login')}
              className="group w-full py-5 bg-white shadow-lg rounded-3xl text-[11px] font-black tracking-[0.2em] uppercase italic flex items-center justify-center gap-3 hover:bg-blue-50 transition-all hover:-translate-y-1 active:translate-y-0"
            >
              <span className="text-slate-900">Re-initialize Cold_Start</span>
              <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="mt-6 text-[9px] font-black text-slate-700 uppercase tracking-widest">
              SmartAccess Secure_Core v4.2.0 · End_Transmission
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
