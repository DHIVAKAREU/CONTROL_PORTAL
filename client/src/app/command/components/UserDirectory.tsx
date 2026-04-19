import React, { useState, useEffect } from 'react';
import { 
  User, Shield, Search, Plus, Edit2, 
  Trash2, CheckCircle2, AlertCircle, X,
  UserPlus, Mail, Lock, ShieldAlert
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface UserIdentity {
  id: string;
  name: string;
  email: string;
  role: string;
  dept: string;
  clearance: number;
  isActive: boolean;
  org?: string;
}

interface UserDirectoryProps {
  onUserCreated?: (user: UserIdentity) => void;
  users: UserIdentity[];
  setUsers: React.Dispatch<React.SetStateAction<UserIdentity[]>>;
  refreshUsers: () => void;
}

export default function UserDirectory({ onUserCreated, users, setUsers, refreshUsers }: UserDirectoryProps) {
  const { token, user: activeUser, logout } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentUser, setCurrentUser] = useState<Partial<UserIdentity & { password?: string }>>({});
  const [successUser, setSuccessUser] = useState<UserIdentity | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [formLoading, setFormLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setFormLoading(true);
    try {
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      const url = modalMode === 'add' ? '/api/admin/create-user' : `/api/admin/update-user/${currentUser.id}`;
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...currentUser,
          dept: currentUser.dept || 'General',
          password: currentUser.password || 'Access@123'
        }),
        cache: 'no-store'
      });
      
      if (res.status === 401) {
        logout();
        return;
      }

      if (res.ok) {
        const result = await res.json();
        
        if (modalMode === 'add') {
          // Optimistic UI for ADD
          setUsers(prev => [result, ...prev]);
          setSuccessUser(result);
          if (onUserCreated) onUserCreated(result);
        } else {
          // Optimistic UI for UPDATE
          setUsers(prev => prev.map(u => u.id === result.id ? result : u));
          setShowModal(false);
        }
        
        refreshUsers(); // Final server sync
      }
    } catch (err) {
      console.error('SAVE_USER_ERROR:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently revoke this identity?')) return;
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/delete-user/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (res.ok) {
        // Optimistic UI update: Remove from local state immediately
        setDeletedIds(prev => new Set([...prev, id]));
        setUsers(prev => prev.filter(u => u.id !== id));
        refreshUsers(); // Sync with server for definitive proof
      }
    } catch (err) {
      console.error('DELETE_USER_ERROR:', err);
    }
  };

  const filteredUsers = users.filter(u => 
    !deletedIds.has(u.id) && (
      u.name.toLowerCase().includes(search.toLowerCase()) || 
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.dept && u.dept.toLowerCase().includes(search.toLowerCase()))
    )
  );

  return (
    <div style={{ padding: "40px", maxWidth: "1600px", margin: "0 auto", width: "100%", animation: "fadeUp .4s ease-out" }}>
      
      {/* Header HUD */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "32px", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", textTransform: "uppercase", fontStyle: "italic" }}>User Directory</h1>
          <p style={{ margin: "4px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase" }}>Identity & Clearance Management</p>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
           <div style={{ position: "relative", width: "320px" }}>
              <Search size={16} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)" }} />
              <input 
                type="text" 
                placeholder="Search identity or department..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "14px 16px 14px 44px", color: "#fff", fontSize: "14px", outline: "none" }}
              />
           </div>
            <button 
              onClick={() => { setSuccessUser(null); setModalMode('add'); setCurrentUser({ role: 'USER', clearance: 1, dept: '' }); setShowModal(true); }}
              style={{ background: "#2563eb", border: "none", borderRadius: "14px", padding: "0 24px", color: "#fff", fontSize: "14px", fontWeight: 800, display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", boxShadow: "0 10px 20px rgba(37,99,235,0.3)", transition: "all 0.2s" }}
            >
              <UserPlus size={18} />
              Provision Ident
            </button>
        </div>
      </header>

      {/* Registry Table */}
      <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "32px", overflow: "hidden" }}>
         <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
               <tr style={{ textAlign: "left", background: "rgba(255,255,255,0.02)" }}>
                  <th style={{ padding: "24px 32px", fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Identity</th>
                  <th style={{ padding: "24px 32px", fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Department</th>
                  <th style={{ padding: "24px 32px", fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>System Role</th>
                  <th style={{ padding: "0 20px", fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", width: "150px" }}>Actions</th>
               </tr>
            </thead>
            <tbody>
               {loading ? (
                 <tr>
                    <td colSpan={4} style={{ padding: "100px", textAlign: "center", color: "rgba(255,255,255,0.1)", fontSize: "14px", fontWeight: 600 }}>SYNCHRONIZING RECON_DATA...</td>
                 </tr>
               ) : filteredUsers.length === 0 ? (
                 <tr>
                    <td colSpan={4} style={{ padding: "100px", textAlign: "center", color: "rgba(255,255,255,0.1)", fontSize: "14px", fontWeight: 600 }}>NO PERSONNEL IDENTITIES LOCATED</td>
                 </tr>
               ) : (
                 filteredUsers.map(user => (
                   <tr key={user.id} style={{ borderTop: "1px solid rgba(255,255,255,0.03)", transition: "all .2s" }}>
                      <td style={{ padding: "24px 32px" }}>
                         <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 900, color: "#3b82f6" }}>
                               {user.name ? user.name.charAt(0) : '?'}
                            </div>
                            <div>
                               <div style={{ fontSize: "15px", fontWeight: 800, color: "#fff" }}>{user.name}</div>
                               <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>{user.email}</div>
                            </div>
                         </div>
                      </td>
                      <td style={{ padding: "24px 32px" }}>
                         <span style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{user.dept || 'General'}</span>
                      </td>
                      <td style={{ padding: "24px 32px" }}>
                         <span style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>{user.role}</span>
                      </td>
                      <td style={{ padding: "20px" }}>
                         <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <button 
                              onClick={() => { setModalMode('edit'); setCurrentUser(user); setShowModal(true); }}
                              style={{ padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", cursor: "pointer", transition: "all .2s" }}
                              onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
                            ><Edit2 size={16} /></button>
                            <button 
                              onClick={() => handleDelete(user.id)}
                              style={{ padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", cursor: "pointer", transition: "all .2s" }}
                              onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
                            ><Trash2 size={16} /></button>
                         </div>
                      </td>
                   </tr>
                 ))
               )}
            </tbody>
         </table>
      </div>

      {/* Provision / Edit Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", animation: "fadeIn .2s ease-out" }}>
          <div style={{ width: "480px", background: "#0d111a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "32px", padding: "40px", animation: "slideUp .3s ease-out", position: "relative", overflow: "hidden" }}>
             
             {/* Success View Overlay */}
             {successUser ? (
               <div style={{ animation: "fadeIn .4s ease-out" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "24px" }}>
                     <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "2px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981", marginBottom: "8px" }}>
                        <CheckCircle2 size={40} />
                     </div>
                     <div>
                        <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>Identity Provisioned</h2>
                        <p style={{ margin: "8px 0 0", fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Personnel Enrollment Complete</p>
                     </div>

                     {/* ID Card Mini Preview */}
                     <div style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "24px", padding: "24px", textAlign: "left" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                           <span style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>Permanent User ID</span>
                           <span style={{ fontSize: "10px", fontWeight: 900, color: "#3b82f6", fontFamily: "monospace" }}>{successUser.id.substring(0, 8)}...</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                           <div style={{ width: "50px", height: "50px", borderRadius: "12px", background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6", fontSize: "20px", fontWeight: 900 }}>
                              {successUser.name[0]}
                           </div>
                           <div>
                              <p style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#fff" }}>{successUser.name}</p>
                              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#3b82f6", fontWeight: 700, textTransform: "uppercase" }}>{successUser.dept}</p>
                           </div>
                        </div>
                     </div>

                     <button 
                       onClick={() => { setSuccessUser(null); setShowModal(false); }}
                       style={{ width: "100%", background: "#3b82f6", border: "none", borderRadius: "16px", padding: "18px", color: "#fff", fontSize: "15px", fontWeight: 800, cursor: "pointer", boxShadow: "0 10px 20px rgba(59,130,246,0.3)" }}
                     >
                        Return to Directory
                     </button>
                  </div>
               </div>
             ) : (
               <>
                 <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                       <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6" }}>
                          {modalMode === 'add' ? <UserPlus size={20} /> : <Edit2 size={20} />}
                       </div>
                       <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#fff", margin: 0 }}>{modalMode === 'add' ? 'Provision Identity' : 'Modify Access'}</h2>
                    </div>
                    <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer" }}><X size={24} /></button>
                 </header>

                 <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                       <label style={{ fontSize: "10px", fontWeight: 900, color: "rgba(59,130,246,0.6)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Full Name</label>
                       <div style={{ position: "relative" }}>
                          <User size={16} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)" }} />
                          <input type="text" required placeholder="Operative Designation" value={currentUser.name || ''} onChange={e => setCurrentUser({...currentUser, name: e.target.value})} style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "12px 16px 12px 44px", color: "#fff", outline: "none" }} />
                       </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                       <label style={{ fontSize: "10px", fontWeight: 900, color: "rgba(59,130,246,0.6)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Email Address</label>
                       <div style={{ position: "relative" }}>
                          <Mail size={16} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)" }} />
                          <input type="email" required placeholder="corp@ident.secure" value={currentUser.email || ''} onChange={e => setCurrentUser({...currentUser, email: e.target.value})} style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "12px 16px 12px 44px", color: "#fff", outline: "none" }} />
                       </div>
                    </div>

                    {modalMode === 'add' && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ fontSize: "10px", fontWeight: 900, color: "rgba(59,130,246,0.6)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Access Password</label>
                        <div style={{ position: "relative" }}>
                            <Lock size={16} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)" }} />
                            <input 
                              type="password" 
                              placeholder="Default: Access@123" 
                              value={currentUser.password || ''} 
                              onChange={e => setCurrentUser({...currentUser, password: e.target.value})} 
                              style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "12px 16px 12px 44px", color: "#fff", outline: "none" }} 
                            />
                        </div>
                        <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", margin: "4px 0 0", fontWeight: 700 }}>Leave blank for system default.</p>
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                       <label style={{ fontSize: "10px", fontWeight: 900, color: "rgba(59,130,246,0.6)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Department / Unit</label>
                       <div style={{ position: "relative" }}>
                          <Shield size={16} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)" }} />
                          <input type="text" placeholder="e.g. Security, Faculty, R&D" value={currentUser.dept || ''} onChange={e => setCurrentUser({...currentUser, dept: e.target.value})} style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "12px 16px 12px 44px", color: "#fff", outline: "none" }} />
                       </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                       <label style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>SYSTEM ROLE</label>
                       <select 
                         value={currentUser.role || 'USER'} 
                         onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
                         style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "14px 16px", color: "#fff", fontSize: "14px", outline: "none" }}
                       >
                          <option value="USER">User</option>
                          <option value="ORG_ADMIN">Organization Admin</option>
                          <option value="PLATFORM_ADMIN">Platform Admin</option>
                       </select>
                    </div>

                    <button 
                      type="submit" 
                      disabled={formLoading}
                      style={{ width: "100%", background: "#3b82f6", border: "none", borderRadius: "16px", padding: "18px", color: "#fff", fontSize: "16px", fontWeight: 900, cursor: "pointer", marginTop: "12px", boxShadow: "0 15px 30px rgba(59,130,246,0.4)" }}
                    >
                      {formLoading ? 'ENROLLING IDENT...' : modalMode === 'add' ? 'PROVISION PERSONNEL' : 'UPDATE IDENTITY'}
                    </button>
                 </form>
               </>
             )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeUp { from {opacity: 0; transform: translateY(20px)} to {opacity: 1; transform: translateY(0)} }
        @keyframes fadeIn { from {opacity: 0} to {opacity: 1} }
        @keyframes slideUp { from {opacity: 0; transform: translateY(20px) scale(0.95)} to {opacity: 1; transform: translateY(0) scale(1)} }
      `}</style>
    </div>
  );
}
