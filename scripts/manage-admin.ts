// Manage admin users from the command line.
//
// Passwords are read from the NEW_ADMIN_PASSWORD environment variable instead
// of command-line arguments (argv ends up in shell history and `ps` output),
// and are never printed. Example:
//
//   read -s "NEW_ADMIN_PASSWORD?New admin password: " && export NEW_ADMIN_PASSWORD
//   npx tsx --env-file=.env scripts/manage-admin.ts create <username>
//   npx tsx --env-file=.env scripts/manage-admin.ts reset <username>
//   unset NEW_ADMIN_PASSWORD
//
import "../api/_lib/env.js";
import { storage } from "../api/_lib/db_storage.js";
import { hashPassword, validateNewAdminPassword, MIN_ADMIN_PASSWORD_LENGTH } from "../api/_lib/security.js";

function readPasswordOrExit(): string {
    const password = process.env.NEW_ADMIN_PASSWORD;
    const error = validateNewAdminPassword(password);
    if (error) {
        console.error(`Error: NEW_ADMIN_PASSWORD: ${error}.`);
        process.exit(1);
    }
    return password as string;
}

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command) {
        console.log("Usage: npx tsx scripts/manage-admin.ts <command> [args]");
        console.log("Commands:");
        console.log("  create <username>   Create a new admin (password from NEW_ADMIN_PASSWORD)");
        console.log("  reset <username>    Reset an admin password (password from NEW_ADMIN_PASSWORD)");
        console.log("  list                List all admins");
        console.log(`Passwords must be at least ${MIN_ADMIN_PASSWORD_LENGTH} characters.`);
        process.exit(1);
    }

    if ((command === "create" || command === "reset") && args.length > 2) {
        console.error("Error: do not pass the password as an argument. Use NEW_ADMIN_PASSWORD.");
        process.exit(1);
    }

    try {
        switch (command) {
            case "create": {
                const username = args[1]?.trim();
                if (!username || username.length < 3 || username.length > 50) {
                    console.error("Error: username required (3-50 characters)");
                    process.exit(1);
                }
                const password = readPasswordOrExit();

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
                const username = args[1]?.trim();
                if (!username) {
                    console.error("Error: username required");
                    process.exit(1);
                }
                const password = readPasswordOrExit();

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
    } catch (error: any) {
        console.error("Operation failed:", error?.message ?? "unknown error");
        process.exit(1);
    }
    process.exit(0);
}

main();
