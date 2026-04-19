const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const db = new sqlite3.Database('database.sqlite');

const defaultZones = [
    { name: 'Executive Suite', code: 'Z-EXEC', desc: 'Secure leadership quarters', cap: 10 },
    { name: 'Cafeteria', code: 'Z-CAFE', desc: 'Primary dining area', cap: 50 },
    { name: 'Server Vault', code: 'Z-VAULT', desc: 'Critical infrastructure core', cap: 5 },
    { name: 'Innovation Lab', code: 'Z-LAB', desc: 'Research and development', cap: 20 },
    { name: 'Lobby', code: 'Z-LOBBY', desc: 'Public reception and entry', cap: 100 },
    { name: 'Dev Hub', code: 'Z-DEV', desc: 'Main engineering workspace', cap: 80 },
    { name: 'Main Entrance', code: 'Z-ENTRY', desc: 'Primary access point', cap: 100 }
];

const targetOrgs = [
    '18091176-79ef-4c8d-9b57-dc26bc361d76', // Juspay
    '673f3248-2f16-43e6-92d1-e64e527d2ef6'  // ACN TECH
];

db.serialize(() => {
    targetOrgs.forEach(orgId => {
        console.log(`Backfilling zones for Org: ${orgId}...`);
        defaultZones.forEach(z => {
            db.run(
                'INSERT INTO zones (id, name, code, description, capacity, occupancy, organization_id) VALUES (?, ?, ?, ?, ?, 0, ?)',
                [crypto.randomUUID(), z.name, z.code, z.desc, z.cap, orgId],
                (err) => {
                    if (err) console.error(`Error inserting ${z.name}:`, err.message);
                }
            );
        });
    });
    console.log('Backfill process initiated.');
});
