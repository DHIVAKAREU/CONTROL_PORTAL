'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Fingerprint, ShieldAlert, Key, ScanLine, Loader2, ShieldCheck, Activity, Cpu, Globe } from 'lucide-react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionExpired = searchParams?.get('reason') === 'session_expired';
  const setAuth = useAuthStore(state => state.setAuth);
  
  const [email, setEmail] = useState('superadmin@system.in');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Parallax Logic
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Status HUD Logic
  const statuses = useMemo(() => [
    "LINK_STABILITY: 99.2% [SYNC]",
    "NODE_CRYPTO: AES-256_ACTIVE",
    "CORE_TEMP: 32.4°C [NOMINAL]",
    "NEURAL_LATENCY: 14ms",
    "ENTROPY_POOL: OVERFLOW_SECURE",
    "TERMINAL_ID: SA-7721-B",
  ], []);
  const [statusIndex, setStatusIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [statuses.length]);

  // Background Shards Logic
  const [shards, setShards] = useState<{left: string, top: string, delay: string, duration: string}[]>([]);
  useEffect(() => {
    setShards([...Array(15)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${10 + Math.random() * 10}s`
    })));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.token, data.user);
      
      if (data.user.role === 'PLATFORM_ADMIN') {
        router.push('/platform');
      } else if (data.user.role === 'ORG_ADMIN') {
        router.push('/command');
      } else {
        router.push('/pass');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'CRITICAL_AUTH_FAILURE: Check credentials.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-[#020617] animate-in fade-in duration-700 overflow-hidden">
      
      {/* Session expired banner */}
      {sessionExpired && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 100, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 12, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 10, backdropFilter: 'blur(8px)' }}>
          <Activity size={14} className="text-red-400" />
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#ef4444', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Session expired — please log in again</p>
        </div>
      )}

      {shards.map((shard, i) => (
        <div 
          key={i}
          className="absolute w-1 h-1 bg-cyan-400/20 rounded-full animate-data-float pointer-events-none"
          style={{
            left: shard.left,
            top: shard.top,
            animationDelay: shard.delay,
            animationDuration: shard.duration
          }}
        />
      ))}

      {/* Grid Effect with Parallax */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none transition-transform duration-300 ease-out" 
        style={{
          backgroundImage: 'radial-gradient(circle at center, #22d3ee 1.5px, transparent 1.5px)', 
          backgroundSize: '32px 32px',
          transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`
        }} 
      />
      
      <div className="absolute top-1/2 left-1/2 w-[350px] h-[350px] border border-cyan-500/20 rounded-full pointer-events-none animate-ripple-slow" />
      <div className="absolute top-1/2 left-1/2 w-[350px] h-[350px] border border-cyan-500/20 rounded-full pointer-events-none animate-ripple-slow animation-delay-2000" />
      <div className="absolute top-1/2 left-1/2 w-[350px] h-[350px] border border-cyan-500/20 rounded-full pointer-events-none animate-ripple-slow animation-delay-4000" />

      {/* Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6 transition-transform duration-300 ease-out"
           style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}>
         
         {/* Biometric Interface */}
         <div className="relative w-44 h-44 flex items-center justify-center mb-8">
            <div className="absolute inset-0 border-[3px] border-dashed border-blue-500/20 rounded-full animate-radar" />
            <div className="absolute inset-4 border-2 border-t-cyan-400/40 border-r-cyan-400/40 border-b-transparent border-l-transparent rounded-full animate-[spin_4s_linear_infinite_reverse]" />
            <div className="absolute inset-8 border border-white/5 rounded-full" />
            
            <div className={`relative w-24 h-24 bg-slate-900/90 border border-blue-500/30 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-700 overflow-hidden ${loading ? 'shadow-[0_0_50px_rgba(6,182,212,0.4)] scale-110' : 'shadow-[0_0_30px_rgba(6,182,212,0.2)]'}`}>
               {loading ? (
                 <Loader2 size={40} className="text-cyan-400 animate-spin" />
               ) : (
                 <Fingerprint size={40} className="text-cyan-400 opacity-60 hover:opacity-100 transition-opacity" />
               )}
               <div className="absolute top-0 left-0 w-full h-1.5 bg-cyan-400/30 shadow-[0_0_15px_#22d3ee] animate-scan-v" />
            </div>
         </div>

         <div className="text-center mb-10 w-full">
            <h2 className="text-2xl font-black text-white tracking-[0.2em] uppercase mb-2 italic">Access Node</h2>
            <div className="flex items-center justify-center gap-3">
               <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
               <span className="text-[10px] font-black text-cyan-500/60 uppercase tracking-[0.3em]">Holographic Link</span>
               <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
            </div>
         </div>

         <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="group relative">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500/30 group-focus-within:text-cyan-400 transition-colors"><ShieldAlert size={16} /></div>
               <input 
                 type="email" 
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="SECURITY_CLEARANCE_ID" 
                 className="w-full bg-[#0a111a]/80 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-[10px] font-black text-white uppercase tracking-widest focus:border-cyan-500/40 focus:bg-[#0c1622] focus:shadow-[0_0_20px_rgba(34,211,238,0.05)] outline-none transition-all placeholder:text-slate-700"
                 required
               />
            </div>
            
            <div className="group relative">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500/30 group-focus-within:text-cyan-400 transition-colors"><Key size={16} /></div>
               <input 
                 type="password" 
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 placeholder="ACCESS_HASH_KEY" 
                 className="w-full bg-[#0a111a]/80 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-[10px] font-black text-white uppercase tracking-[0.3em] focus:border-cyan-500/40 focus:bg-[#0c1622] focus:shadow-[0_0_20px_rgba(34,211,238,0.05)] outline-none transition-all placeholder:text-slate-700"
                 required
               />
            </div>

            {error && (
              <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                <Activity size={14} className="text-red-500 animate-pulse" />
                <p className="text-[10px] font-black text-red-500/80 uppercase tracking-widest leading-tight">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-4 relative overflow-hidden rounded-2xl p-[1px] group disabled:opacity-50"
            >
               <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 opacity-60 group-hover:opacity-100 transition-opacity animate-pulse" />
               <div className="relative bg-[#020617] px-4 py-4 rounded-2xl flex items-center justify-center gap-3 group-hover:bg-[#050b1a] transition-all">
                  <span className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.2em]">
                    {loading ? 'SYNCHRONIZING...' : 'Login to System'}
                  </span>
                  {loading ? <Loader2 size={14} className="text-cyan-400 animate-spin" /> : <ScanLine size={14} className="text-cyan-400" />}
               </div>
            </button>
         </form>


         {/* Final Status Footer */}
         <div className="mt-12 text-center">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.02] border border-white/5 rounded-full mb-4">
              <Cpu size={10} className="text-blue-500/50" />
              <span className="text-[8px] font-mono font-black text-slate-600 uppercase tracking-widest animate-glitch-text">
                {statuses[statusIndex]}
              </span>
           </div>
           <p className="text-[9px] text-slate-800 font-black uppercase tracking-[0.4em] opacity-40">
             SmartAccess Multi-Tenant Foundation
           </p>
         </div>
      </div>
    </div>
  );
}
