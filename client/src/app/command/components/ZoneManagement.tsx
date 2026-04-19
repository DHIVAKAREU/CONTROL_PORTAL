'use client';

import React, { useState } from 'react';
import { 
  Plus, MapPin, Edit2, Trash2, 
  Layout, Shield, Users, Crosshair,
  Building2, Hash, Maximize2, AlertCircle,
  X, CheckCircle2, Loader2, Info
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';

interface Zone {
  id: string;
  name: string;
  code: string;
  description: string;
  capacity: number;
  occupancy: number;
  pos_x: number;
  pos_y: number;
}

interface ZoneManagementProps {
  zones: Zone[];
  setZones: React.Dispatch<React.SetStateAction<Zone[]>>;
  refreshZones: () => void;
}

export default function ZoneManagement({ zones, setZones, refreshZones }: ZoneManagementProps) {
  const { token, logout } = useAuthStore();
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentZone, setCurrentZone] = useState<Partial<Zone>>({ pos_x: 50, pos_y: 50 });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenModal = (mode: 'add' | 'edit', zone?: Zone) => {
    setModalMode(mode);
    setCurrentZone(zone || { pos_x: 50, pos_y: 50 });
    setShowModal(true);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSaving(true);
    setError(null);

    try {
      const isAdd = modalMode === 'add';
      const endpoint = isAdd ? '/api/zones' : `/api/zones/${currentZone.id}`;
      const method = isAdd ? 'POST' : 'PUT';

      const res = await fetch(endpoint, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(currentZone)
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (res.ok) {
        const saved = await res.json();
        if (isAdd) {
            setZones(prev => [...prev, saved]);
        } else {
            setZones(prev => prev.map(z => z.id === saved.id ? saved : z));
        }
        setShowModal(false);
        refreshZones();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to save zone');
      }
    } catch (err) {
      setError('Connection failure');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this zone and all its associations?')) return;
    if (!token) return;
    try {
      const res = await fetch(`/api/zones/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setZones(prev => prev.filter(z => z.id !== id));
        refreshZones();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 animate-in fade-in duration-700">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">Infrastructure Management</h1>
          <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2 italic flex items-center gap-2">
            <Layout size={12} className="text-blue-500" />
            Platform Resource Provisioning • Logical Node Clustering
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal('add')}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-[0_0_30px_rgba(37,99,235,0.3)]"
        >
          <Plus size={16} />
          Provision New Room
        </button>
      </header>

      {/* Grid of Zones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {zones.map(zone => (
          <div key={zone.id} className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.05] hover:border-blue-500/30 transition-all group overflow-hidden relative">
            {/* Background Decoration */}
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <MapPin size={120} />
            </div>

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                {zone.name.toLowerCase().includes('server') ? <Crosshair size={24} /> : 
                 zone.name.toLowerCase().includes('entrance') ? <Layout size={24} /> : <MapPin size={24} />}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleOpenModal('edit', zone)}
                  className="p-2 hover:bg-blue-500/20 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(zone.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="mb-6 relative z-10">
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1">{zone.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded uppercase tracking-widest">{zone.code}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">{zone.description || 'No specialized purpose defined'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="bg-black/20 rounded-2xl p-3 border border-white/[0.03]">
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Maximize2 size={10} /> Capacity
                </p>
                <p className="text-lg font-black text-white">{zone.capacity}</p>
              </div>
              <div className="bg-black/20 rounded-2xl p-3 border border-white/[0.03]">
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Crosshair size={10} /> Position
                </p>
                <p className="text-lg font-black text-white">{Math.round(zone.pos_x)}% / {Math.round(zone.pos_y)}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {zones.length === 0 && (
        <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800/20 rounded-full mb-6">
                <Building2 size={32} className="text-slate-600" />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-widest">No Infrastructure Provisioned</h3>
            <p className="text-slate-500 text-xs mt-2 max-w-xs mx-auto">Create your first room to begin building the tactical network.</p>
        </div>
      )}

      {/* Modal Engine */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60">
          <div className="bg-[#0b1424] border border-white/10 w-full max-w-4xl rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200">
            <form onSubmit={handleSave}>
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Plus size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">
                      {modalMode === 'add' ? 'Provision Infrastructure Node' : 'Modify Node Parameters'}
                    </h2>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Infrastructure Configuration Interface</p>
                  </div>
                </div>
                <button type="button" onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Basic Details */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Hash size={12} className="text-blue-500" /> Room Identity / Name
                    </label>
                    <input 
                      required
                      value={currentZone.name || ''}
                      onChange={e => setCurrentZone({...currentZone, name: e.target.value})}
                      placeholder="e.g. EXECUTIVE_VAULT_7"
                      className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol Code</label>
                        <input 
                            value={currentZone.code || ''}
                            onChange={e => setCurrentZone({...currentZone, code: e.target.value})}
                            placeholder="Z-101"
                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700 uppercase"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Unit Max Capacity</label>
                        <input 
                            type="number"
                            value={currentZone.capacity || ''}
                            onChange={e => setCurrentZone({...currentZone, capacity: parseInt(e.target.value)})}
                            placeholder="50"
                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                        />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Architectural Description</label>
                    <textarea 
                      value={currentZone.description || ''}
                      onChange={e => setCurrentZone({...currentZone, description: e.target.value})}
                      rows={3}
                      placeholder="Specialized purpose or security constraints..."
                      className="w-full bg-black/40 border border-white/5 rounded-3xl py-4 px-6 text-sm text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700 resize-none"
                    />
                  </div>
                </div>

                {/* Map Positioning Picker */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                            <span className="flex items-center gap-2"><Maximize2 size={12} className="text-blue-500" /> Tactical Positioning</span>
                            <span className="text-blue-500 font-mono">X:{Math.round(currentZone.pos_x || 50)}% Y:{Math.round(currentZone.pos_y || 50)}%</span>
                        </label>
                        
                        <div 
                            className="aspect-video bg-black/60 border border-white/10 rounded-3xl relative overflow-hidden group/map cursor-crosshair"
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = ((e.clientX - rect.left) / rect.width) * 100;
                                const y = ((e.clientY - rect.top) / rect.height) * 100;
                                setCurrentZone({...currentZone, pos_x: x, pos_y: y});
                            }}
                        >
                            {/* Grid Lines */}
                            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                            
                            {/* Marker */}
                            <div 
                                className="absolute w-8 h-8 -ml-4 -mt-4 flex items-center justify-center transition-all duration-300"
                                style={{ left: `${currentZone.pos_x}%`, top: `${currentZone.pos_y}%` }}
                            >
                                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
                                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.5)] z-10" />
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-blue-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-lg">
                                    {currentZone.name || 'NEW_NODE'}
                                </div>
                            </div>

                            <div className="absolute bottom-4 left-4 right-4 text-center opacity-40 group-hover/map:opacity-80 transition-opacity">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Click on the grid to anchor the room position</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl space-y-3">
                        <div className="flex items-start gap-4">
                            <Info size={16} className="text-blue-400 mt-1 shrink-0" />
                            <p className="text-[11px] text-blue-200/60 leading-relaxed italic">
                                Rooms anchor the tactical map. Precise positioning ensures the **Live Map** reflects your actual infrastructure layout.
                            </p>
                        </div>
                    </div>
                </div>
              </div>

              {error && (
                <div className="px-10 pb-6 flex items-center gap-3 text-red-500 animate-bounce">
                  <AlertCircle size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{error}</span>
                </div>
              )}

              <div className="p-10 border-t border-white/5 bg-white/[0.01] flex justify-end gap-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-8 py-4 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-3 shadow-[0_0_50px_rgba(37,99,235,0.2)] disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={16} />}
                  {isSaving ? 'Synchronizing...' : (modalMode === 'add' ? 'Commit Infrastructure' : 'Update Parameters')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
