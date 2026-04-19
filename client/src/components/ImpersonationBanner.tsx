'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { ShieldAlert, LogOut, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ImpersonationBanner = () => {
  const { user, impersonatingFrom, stopImpersonate } = useAuthStore();
  const [isStopping, setIsStopping] = React.useState(false);

  if (!impersonatingFrom) return null;

  const handleStop = async () => {
    setIsStopping(true);
    // Add small delay for aesthetic effect
    setTimeout(() => {
      stopImpersonate();
      window.location.href = '/platform';
    }, 1000);
  };

  return (
    <div className="sticky top-0 left-0 right-0 z-[100] bg-[#f59e0b] text-black h-10 flex items-center justify-between px-6 shadow-[0_4px_30px_rgba(245,158,11,0.4)] border-b border-black/10 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-2 py-0.5 bg-black text-[#f59e0b] rounded font-mono text-[90%] font-black animate-pulse">
           <ShieldAlert className="w-3.5 h-3.5" />
           GOD_MODE
        </div>
        <span className="text-[11px] font-bold uppercase tracking-widest font-sans">
          Impersonation Active — Operating as <span className="underline decoration-2 font-black">{user?.name || user?.slug}</span>
        </span>
      </div>
      
      <button 
        onClick={handleStop}
        disabled={isStopping}
        className={cn(
          "bg-black text-[#f59e0b] hover:bg-[#1a1a1a] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-[#f59e0b]/20 shadow-lg",
          isStopping && "opacity-50 cursor-not-allowed"
        )}
      >
        {isStopping ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <LogOut className="w-3.5 h-3.5" />
        )}
        {isStopping ? 'Restoring Identity...' : 'Terminate Link & Return to Hub'}
      </button>
    </div>
  );
};
