// Create an admin user in the database.
//
// Credentials are read from environment variables, never hardcoded, and the
// password is never printed. Example (zsh/bash; `read -s` keeps the password
// out of shell history):
//
//   read -s "NEW_ADMIN_PASSWORD?New admin password: " && export NEW_ADMIN_PASSWORD
//   NEW_ADMIN_USERNAME=<username> npx tsx --env-file=.env scripts/create_admin.ts
//   unset NEW_ADMIN_PASSWORD
//
// Load environment variables FIRST - same pattern as api/_lib/index.ts
import '../api/_lib/env.js';

import { storage } from '../api/_lib/db_storage.js';
import { hashPassword, validateNewAdminPassword } from '../api/_lib/security.js';

async function createAdmin() {
    const username = process.env.NEW_ADMIN_USERNAME?.trim();
    const password = process.env.NEW_ADMIN_PASSWORD;

    if (!username || username.length < 3 || username.length > 50) {
        console.error('❌ NEW_ADMIN_USERNAME must be set (3-50 characters).');
        process.exit(1);
    }

    const passwordError = validateNewAdminPassword(password);
    if (passwordError) {
        console.error(`❌ NEW_ADMIN_PASSWORD: ${passwordError}.`);
        process.exit(1);
    }

    console.log(`\n🔐 Creating admin user "${username}"...`);

    try {
        const existing = await storage.getAdminUserByUsername(username);
        if (existing) {
            console.error(`⚠️  Admin user "${username}" already exists. Nothing changed.`);
            process.exit(1);
        }

        const passwordHash = await hashPassword(password as string);
        const admin = await storage.createAdminUser({ username, passwordHash });

        console.log(`✅ Admin user "${admin.username}" created (ID: ${admin.id}).`);
    } catch (error: any) {
        if (error?.code === '23505') {
            console.error(`⚠️  Admin user "${username}" already exists. Nothing changed.`);
        } else {
            // Log only the message; never the request data.
            console.error('❌ Error creating admin:', error?.message ?? 'unknown error');
        }
        process.exit(1);
    }

    process.exit(0);
}

createAdmin();
