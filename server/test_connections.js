const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const configs = [
  { host: 'localhost', user: 'root', password: 'DHIVAKAR', database: 'access_control_db' },
  { host: '127.0.0.1', user: 'root', password: 'DHIVAKAR', database: 'access_control_db' },
  { host: 'localhost', user: 'root', password: '', database: 'access_control_db' },
  { host: '127.0.0.1', user: 'root', password: '', database: 'access_control_db' },
  { host: 'localhost', user: 'root', password: 'root', database: 'access_control_db' },
];

async function test() {
  for (const config of configs) {
    console.log(`Testing: user=${config.user}, pass=${config.password ? 'YES' : 'NO'}, host=${config.host}`);
    try {
      const connection = await mysql.createConnection(config);
      console.log('✅ SUCCESS!');
      console.log('Use this connection string:', `mysql://${config.user}${config.password ? ':' + config.password : ''}@${config.host}:3306/${config.database}`);
      await connection.end();
      return;
    } catch (err) {
      console.log('❌ FAILED:', err.message);
    }
  }
}

test();
