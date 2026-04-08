import { getDb } from './src/config/db';
import bcrypt from 'bcrypt';

async function verify() {
  const db = await getDb();
  console.log('Verifying Personnel Provisioning...');

  // Check if dept column exists and check for a test user
  const user = await db.get("SELECT * FROM User WHERE name = 'System_Test_Operative'");
  
  if (user) {
    console.log('✅ Found Test Operative:', user.name);
    console.log('✅ Department:', user.dept);
    console.log('✅ Clearance:', user.clearance);
    
    const passwordMatch = await bcrypt.compare('testpass123', user.password);
    console.log('✅ Password Hash Verification:', passwordMatch ? 'SUCCESS' : 'FAILED');
  } else {
    console.log('❌ Test Operative not found. Please provision via HUD or create via script.');
  }
}

verify();
