import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, Calendar, Clock } from 'lucide-react';

interface TacticalPickerProps {
  mode: 'date' | 'time';
  onSelect: (val: string) => void;
  onClose: () => void;
  anchor?: 'left' | 'right';
}

export default function TacticalPicker({ mode, onSelect, onClose, anchor = 'right' }: TacticalPickerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Date Logic
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  
  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const handleDateClick = (day: number) => {
    const d = day < 10 ? `0${day}` : day;
    const m = (currentDate.getMonth() + 1) < 10 ? `0${currentDate.getMonth() + 1}` : currentDate.getMonth() + 1;
    onSelect(`${d}-${m}-${currentDate.getFullYear()}`);
    onClose();
  };

  // Time Logic
  const [hour, setHour] = useState("00");
  const [minute, setMinute] = useState("00");

  const hours = Array.from({ length: 24 }, (_, i) => i < 10 ? `0${i}` : `${i}`);
  const minutes = Array.from({ length: 60 }, (_, i) => i < 10 ? `0${i}` : `${i}`);

  return (
    <div style={{ 
      position: "fixed", 
      inset: 0, 
      zIndex: 2000, 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      background: "rgba(0,0,0,0.4)", 
      backdropFilter: "blur(8px)",
      animation: "fadeIn .2s ease-out"
    }} onClick={onClose}>
      <div style={{ 
        width: mode === 'date' ? "380px" : "320px", 
        background: "rgba(13, 20, 36, 0.98)", 
        border: "1px solid rgba(255, 255, 255, 0.12)", 
        borderRadius: "32px", 
        boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)",
        padding: "32px",
        animation: "slideUp .3s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative"
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
           <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6" }}>
                 {mode === 'date' ? <Calendar size={18} /> : <Clock size={18} />}
              </div>
              <h2 style={{ fontSize: "16px", fontWeight: 900, color: "#fff", letterSpacing: "-0.01em", margin: 0 }}>{mode === 'date' ? 'Select Start Date' : 'Assign Entry Time'}</h2>
           </div>
           <button onClick={onClose} style={{ background: "rgba(255,255,255,0.03)", border: "none", borderRadius: "10px", padding: "8px", color: "rgba(255,255,255,0.3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} /></button>
        </header>

        {mode === 'date' ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Calendar Controls */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} style={{ background: "transparent", border: "none", color: "#3b82f6", cursor: "pointer", display: "flex" }}><ChevronLeft size={20} /></button>
               <span style={{ fontSize: "15px", fontWeight: 800, color: "#fff" }}>{months[currentDate.getMonth()]}, {currentDate.getFullYear()}</span>
               <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} style={{ background: "transparent", border: "none", color: "#3b82f6", cursor: "pointer", display: "flex" }}><ChevronRight size={20} /></button>
            </div>

            {/* Grid Module */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
               <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                  {days.map(d => (
                    <span key={d} style={{ textAlign: "center", fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{d}</span>
                  ))}
               </div>
               <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px" }}>
                  {Array.from({ length: getFirstDayOfMonth(currentDate.getMonth(), currentDate.getFullYear()) }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: getDaysInMonth(currentDate.getMonth(), currentDate.getFullYear()) }).map((_, i) => {
                    const dayNum = i + 1;
                    const isToday = new Date().getDate() === dayNum && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
                    return (
                      <button 
                        key={dayNum} 
                        onClick={() => handleDateClick(dayNum)}
                        style={{ 
                          aspectRatio: "1/1",
                          width: "100%",
                          borderRadius: "12px", 
                          background: isToday ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.02)", 
                          border: isToday ? "1px solid rgba(59,130,246,0.4)" : "1px solid rgba(255,255,255,0.03)",
                          color: isToday ? "#3b82f6" : "rgba(255,255,255,0.6)",
                          fontSize: "13px",
                          fontWeight: isToday ? 900 : 500,
                          cursor: "pointer",
                          transition: "all .2s",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                        onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.1)"}
                        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = isToday ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.02)"}
                      >
                        {dayNum}
                      </button>
                    );
                  })}
               </div>
            </div>

            <footer style={{ display: "flex", gap: "12px", paddingTop: "8px" }}>
               <button onClick={() => { onSelect(""); onClose(); }} style={{ flex: 1, padding: "12px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.4)", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}>Clear Selection</button>
               <button onClick={() => { setCurrentDate(new Date()); }} style={{ flex: 1.2, padding: "12px", borderRadius: "14px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#3b82f6", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}>Select Today</button>
            </footer>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
             <div style={{ display: "flex", justifyContent: "center", gap: "12px", height: "240px", overflow: "hidden", position: "relative" }}>
               {/* Selection Frame */}
               <div style={{ position: "absolute", top: "50%", left: 0, width: "100%", height: "52px", background: "rgba(59,130,246,0.12)", borderBlock: "1px solid rgba(59,130,246,0.3)", marginTop: "-26px", pointerEvents: "none", zIndex: 0 }} />
               
               {/* Column Scrollers */}
               <div className="picker-col" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: "180px", paddingTop: "96px", zIndex: 1, scrollSnapType: "y mandatory" }}>
                  {hours.map(h => (
                    <button key={h} onClick={() => setHour(h)} style={{ minHeight: "52px", fontSize: hour === h ? "32px" : "18px", fontWeight: hour === h ? 900 : 500, color: hour === h ? "#fff" : "rgba(255,255,255,0.15)", background: "transparent", border: "none", cursor: "pointer", transition: "all .3s", scrollSnapAlign: "center" }}>{h}</button>
                  ))}
               </div>
               <div style={{ fontSize: "24px", fontWeight: 900, color: "rgba(59,130,246,0.2)", display: "flex", alignItems: "center", paddingBottom: "6px" }}>:</div>
               <div className="picker-col" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: "180px", paddingTop: "96px", zIndex: 1, scrollSnapType: "y mandatory" }}>
                  {minutes.map(m => (
                     <button key={m} onClick={() => setMinute(m)} style={{ minHeight: "52px", fontSize: minute === m ? "32px" : "18px", fontWeight: minute === m ? 900 : 500, color: minute === m ? "#fff" : "rgba(255,255,255,0.15)", background: "transparent", border: "none", cursor: "pointer", transition: "all .3s", scrollSnapAlign: "center" }}>{m}</button>
                  ))}
               </div>
             </div>

             <button 
               onClick={() => { onSelect(`${hour}:${minute}`); onClose(); }}
               style={{ width: "100%", background: "#3b82f6", border: "none", borderRadius: "18px", padding: "16px", color: "#fff", fontWeight: 950, cursor: "pointer", fontSize: "16px", textTransform: "uppercase", letterSpacing: "0.02em", boxShadow: "0 15px 35px rgba(59,130,246,0.35)", transition: "all .2s" }}
               onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"}
               onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.transform = "translateY(0)"}
             >
               Confirm Selection
             </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn { from {opacity: 0} to {opacity: 1} }
        @keyframes slideUp { from {opacity: 0; transform: translateY(20px) scale(0.98)} to {opacity: 1; transform: translateY(0) scale(1)} }
        .picker-col::-webkit-scrollbar { display: none; }
        .picker-col { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
