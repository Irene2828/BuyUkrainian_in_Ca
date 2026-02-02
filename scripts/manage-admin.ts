
import { storage } from "../server/storage";
import { hashPassword } from "../server/security";

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command) {
        console.log("Usage: node scripts/manage-admin.ts <command> [args]");
        console.log("Commands:");
        console.log("  create <username> <password>  Create a new admin");
        console.log("  reset <username> <password>   Reset an admin password");
        console.log("  list                          List all admins");
        process.exit(1);
    }

    try {
        switch (command) {
            case "create": {
                const [username, password] = args.slice(1);
                if (!username || !password) {
                    console.error("Error: username and password required");
                    process.exit(1);
                }

                const existing = await storage.getAdminUserByUsername(username);
                if (existing) {
                    console.error("Error: Admin user already exists");
                    process.exit(1);
                }

                const passwordHash = await hashPassword(password);
                const user = await storage.createAdminUser({ username, passwordHash });
                console.log(`Admin user '${user.username}' created successfully.`);
                break;
            }

            case "reset": {
                const [username, password] = args.slice(1);
                if (!username || !password) {
                    console.error("Error: username and password required");
                    process.exit(1);
                }

                const existing = await storage.getAdminUserByUsername(username);
                if (!existing) {
                    console.error("Error: Admin user not found");
                    process.exit(1);
                }

                const passwordHash = await hashPassword(password);
                await storage.updateAdminPassword(existing.id, passwordHash);
                console.log(`Password for '${username}' updated successfully.`);
                break;
            }

            case "list": {
                const admins = await storage.getAllAdminUsers();
                console.log("Current Admins:");
                admins.forEach(a => console.log(`- ${a.username} (ID: ${a.id})`));
                break;
            }

            default:
                console.error("Unknown command");
                process.exit(1);
        }
    } catch (error) {
        console.error("Operation failed:", error);
        process.exit(1);
    }
}

main();
