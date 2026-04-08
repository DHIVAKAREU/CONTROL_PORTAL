import { getDb } from './src/config/db';
import crypto from 'crypto';

async function seed() {
  const db = await getDb();
  
  // Get first org
  const org = await db.get("SELECT * FROM organizations LIMIT 1");
  if (!org) {
    console.error("NO_ORGANIZATION_FOUND");
    return;
  }
  
  console.log(`SEEDING_ZONES_FOR_ORG: ${org.name} (${org.id})`);
  
  const zones = [
    { name: 'Executive Suite', capacity: 20, color: '#22c55e' },
    { name: 'Cafeteria', capacity: 150, color: '#ef4444' },
    { name: 'Server Vault', capacity: 10, color: '#f59e0b' },
    { name: 'Innovation Lab', capacity: 40, color: '#64748b' },
    { name: 'Lobby', capacity: 200, color: '#a78bfa' },
    { name: 'Dev Hub', capacity: 100, color: '#22c55e' },
    { name: 'Main Entrance', capacity: 500, color: '#22c55e' }
  ];
  
  for (const z of zones) {
    const existing = await db.get("SELECT id FROM zones WHERE name = ? AND organization_id = ?", [z.name, org.id]);
    if (!existing) {
      const id = crypto.randomUUID();
      await db.run(
        "INSERT INTO zones (id, name, capacity, occupancy, organization_id, code) VALUES (?, ?, ?, ?, ?, ?)",
        [id, z.name, z.capacity, Math.floor(Math.random() * z.capacity), org.id, `Z-${Math.floor(100+Math.random()*900)}`]
      );
      console.log(`CREATED_ZONE: ${z.name}`);
    } else {
      console.log(`ZONE_EXISTS: ${z.name}`);
    }
  }
}

seed().catch(console.error);
