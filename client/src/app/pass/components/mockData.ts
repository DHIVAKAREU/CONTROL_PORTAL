export const ZONES = [
  { id: "z01", code: "Z-01", name: "Main Lobby", type: "Public Area", status: "granted", floor: 1, occ: 42, cap: 100, hours: "24/7", lastEntry: "Today 09:12 AM" },
  { id: "z02", code: "Z-02", name: "R&D Hub", type: "Workspace Area", status: "granted", floor: 2, occ: 18, cap: 40, hours: "8AM–8PM", lastEntry: "Today 10:44 AM" },
  { id: "z03", code: "Z-04", name: "Executive Suite", type: "Restricted Area", status: "denied", floor: 3, occ: 5, cap: 15, hours: "By appointment", lastEntry: "Never" },
  { id: "z04", code: "Z-05", name: "Cafeteria", type: "Public Area", status: "granted", floor: 1, occ: 67, cap: 120, hours: "7AM–10PM", lastEntry: "Today 08:30 AM" },
  { id: "z05", code: "Z-06", name: "Server Room", type: "Restricted Area", status: "denied", floor: 'B1', occ: 2, cap: 8, hours: "Authorized only", lastEntry: "Never" },
  { id: "z06", code: "Z-07", name: "Library", type: "Study Area", status: "granted", floor: 2, occ: 23, cap: 60, hours: "6AM–11PM", lastEntry: "Yesterday" },
  { id: "z07", code: "Z-08", name: "Gymnasium", type: "Recreation", status: "granted", floor: 1, occ: 11, cap: 50, hours: "5AM–10PM", lastEntry: "2 days ago" },
];

export const ACTIVITY = [
  { id: 1, zone: "R&D Hub", code: "Z-02", time: "10:44 AM", date: "Today", type: "entry", method: "QR Code", ok: true },
  { id: 2, zone: "Main Lobby", code: "Z-01", time: "09:12 AM", date: "Today", type: "entry", method: "NFC", ok: true },
  { id: 3, zone: "Cafeteria", code: "Z-05", time: "08:30 AM", date: "Today", type: "entry", method: "NFC", ok: true },
  { id: 4, zone: "Server Room", code: "Z-SRV", time: "05:22 AM", date: "Today", type: "denied", method: "QR Code", ok: false },
  { id: 5, zone: "Library", code: "Z-06", time: "07:15 PM", date: "Yesterday", type: "exit", method: "NFC", ok: true },
  { id: 6, zone: "R&D Hub", code: "Z-02", time: "02:30 PM", date: "Yesterday", type: "entry", method: "Biometric", ok: true },
  { id: 7, zone: "Main Lobby", code: "Z-01", time: "09:00 AM", date: "Yesterday", type: "entry", method: "NFC", ok: true },
  { id: 8, zone: "Executive Suite", code: "Z-04", time: "11:00 AM", date: "Apr 5", type: "denied", method: "QR Code", ok: false },
];

export const SESSIONS = [
  { id: 1, device: "MacBook Pro 14″", os: "macOS 14.4", browser: "Chrome 124", loc: "Chennai, IN", ip: "192.168.1.45", time: "Active now", current: true },
  { id: 2, device: "iPhone 15 Pro", os: "iOS 17.4", browser: "Safari", loc: "Chennai, IN", ip: "192.168.1.60", time: "2h ago", current: false },
  { id: 3, device: "iPad Air", os: "iPadOS 17", browser: "Safari", loc: "Chennai, IN", ip: "10.0.0.88", time: "1d ago", current: false },
];

export const NOTIFICATIONS = [
  { id: 1, icon: "🔑", title: "Access granted to R&D Hub", sub: "Today 10:44 AM", read: false },
  { id: 2, icon: "⛔", title: "Access denied: Server Room", sub: "Today 05:22 AM", read: false },
  { id: 3, icon: "📅", title: "Pass expires in 30 days", sub: "Renew before May 7", read: true },
  { id: 4, icon: "🔒", title: "New login from iPhone 15 Pro", sub: "2 hours ago", read: true },
];

export const REQUESTS = [
  { id: 1, zone: "Server Room", code: "Z-SRV", submitted: "Apr 5, 2026", status: "pending", reason: "Maintenance work" },
  { id: 2, zone: "Executive Suite", code: "Z-04", submitted: "Mar 12, 2026", status: "rejected", reason: "Team meeting" },
];
