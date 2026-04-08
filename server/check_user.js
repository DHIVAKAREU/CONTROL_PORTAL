const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.sqlite');
const email = 'SUPERADMIN@SMARTACCESS.IO';

db.get("SELECT email, password, isActive, orgId FROM User WHERE email = ?", [email], (err, row) => {
    if (err) {
        console.error(err);
    } else if (row) {
        console.log('USER_FOUND:', JSON.stringify(row, null, 2));
    } else {
        console.log('USER_NOT_FOUND');
    }
    db.close();
});
