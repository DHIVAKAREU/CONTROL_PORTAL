const fs = require('fs');
const path = 'src/app/command/page.tsx';
let c = fs.readFileSync(path, 'utf8');

// Global replacement of the broken coordinate ternary
const broken = "? { top: ${zone.pos_y}%, left: ${zone.pos_x}%, color: '#6366f1', icon: <MapPin size={12} /> }";
const fixed = "? { top: `${zone.pos_y}%`, left: `${zone.pos_x}%`, color: '#6366f1', icon: <MapPin size={12} /> }";

if (c.includes(broken)) {
    console.log("FOUND_AND_FIXING_ALL...");
    c = c.split(broken).join(fixed);
    fs.writeFileSync(path, c, 'utf8');
    console.log("FIX_SUCCESSFUL");
} else {
    console.log("SEARCH_STRING_NOT_FOUND_IN_GLOBAL_SWEEP");
}
