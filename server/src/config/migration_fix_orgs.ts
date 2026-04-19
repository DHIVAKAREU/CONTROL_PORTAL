
import { getDb } from './db';

async function migrate() {
    const db = await getDb();
    console.log('--- STARTING SCHEMA UPDATE (Organizations Table) ---');

    try {
        console.log('Adding "slug" column...');
        await db.run('ALTER TABLE organizations ADD COLUMN slug TEXT');
    } catch (e: any) {
        if (e.message.includes('duplicate column name')) console.log('Slug already exists.');
        else console.error('Error adding slug:', e.message);
    }

    try {
        console.log('Adding "status" column...');
        await db.run("ALTER TABLE organizations ADD COLUMN status TEXT DEFAULT 'ACTIVE'");
    } catch (e: any) {
        if (e.message.includes('duplicate column name')) console.log('Status already exists.');
        else console.error('Error adding status:', e.message);
    }

    try {
        console.log('Adding "plan" column...');
        await db.run("ALTER TABLE organizations ADD COLUMN plan TEXT DEFAULT 'STARTER'");
    } catch (e: any) {
        if (e.message.includes('duplicate column name')) console.log('Plan already exists.');
        else console.error('Error adding plan:', e.message);
    }

    // Populate missing slugs for existing records
    console.log('Populating missing slugs for existing organizations...');
    const orgs = await db.all('SELECT id, name FROM organizations WHERE slug IS NULL');
    for (const org of orgs) {
        const slug = org.name.replace(/\s+/g, '-').toUpperCase().substring(0, 12);
        await db.run('UPDATE organizations SET slug = ? WHERE id = ?', [slug, org.id]);
        console.log(`Updated organization [${org.name}] with slug [${slug}]`);
    }

    console.log('--- SCHEMA UPDATE COMPLETED ---');
}

migrate().catch(console.error);
