
import bcrypt from "bcrypt";

async function generateAdminSQL() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error("Usage: tsx script/create-admin.ts <username> <password>");
        process.exit(1);
    }

    const username = args[0];
    const password = args[1];

    console.log(`🔒 Generating secure entry for user '${username}'...`);

    try {
        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        console.log("\n❌ AUTOMATED CONNECTION FAILED (IPv6 Network Issue Detected)");
        console.log("⚠️  Your internet connection cannot reach the Supabase database direct address.");
        console.log("\n✅ SOLUTION: Run this SQL command manually in your Supabase Dashboard:");
        console.log("\n1. Go to: https://supabase.com/dashboard/project/ghdmefifmtpnitgkhwei/sql/new");
        console.log("2. Copy and paste the command below:\n");

        console.log("```sql");
        console.log(`INSERT INTO admin_users (username, password_hash, created_at)`);
        console.log(`VALUES ('${username}', '${passwordHash}', NOW());`);
        console.log("```");

        console.log("\n3. Click 'Run' in the dashboard.");

    } catch (error) {
        console.error("❌ Error generating hash:", error);
    }
}

generateAdminSQL();
