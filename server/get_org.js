const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.sqlite');
db.get("SELECT id FROM Organization WHERE slug = 'smartaccess'", (err, row) => {
    if (err) {
        console.error(err);
    } else if (row) {
        console.log('ORG_ID:', row.id);
    } else {
        console.log('ORG_NOT_FOUND');
    }
    db.close();
});
