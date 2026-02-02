// Load environment variables FIRST - same pattern as api/_lib/index.ts
import '../api/_lib/env.js';

import { storage } from '../api/_lib/db_storage.js';
import bcrypt from 'bcrypt';

async function createAdmin() {
    const username = 'iryna';
    const password = 'UkraineStrong2026!';

    console.log('\n🔐 Creating admin user...');
    console.log('Username:', username);
    console.log('Password:', password);

    try {
        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create the admin user
        const admin = await storage.createAdminUser({
            username,
            passwordHash,
        });

        console.log('\n✅ Admin user created successfully!');
        console.log('User ID:', admin.id);
        console.log('\n📋 LOGIN CREDENTIALS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔑 Username: ' + username);
        console.log('🔑 Password: ' + password);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n🌐 Go to: http://localhost:5001/admin/login');
        console.log('🔐 After logging in, please change your password immediately!\n');

    } catch (error: any) {
        if (error.message?.includes('duplicate') || error.code === '23505') {
            console.log('\n⚠️  Admin user already exists with username:', username);
            console.log('\n📋 Try logging in with:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🔑 Username: ' + username);
            console.log('🔑 Password: ' + password);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        } else {
            console.error('❌ Error creating admin:', error);
        }
    }

    process.exit(0);
}

createAdmin();
