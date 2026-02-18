import { storage } from "./api/_lib/db_storage.ts";

async function dump() {
    try {
        const all = await storage.getAllStores();
        console.log("--- ALL STORES IN DB ---");
        all.forEach(s => {
            console.log(`ID: ${s.id}, Name: ${s.name}, Status: ${s.status}`);
        });

        const approved = await storage.getApprovedStores();
        console.log("\n--- APPROVED STORES IN DB ---");
        approved.forEach(s => {
            console.log(`ID: ${s.id}, Name: ${s.name}, Status: ${s.status}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

dump();
