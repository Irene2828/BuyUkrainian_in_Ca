
const baseUrl = "http://localhost:3000";

async function verify() {
    try {
        console.log("1. Submitting new store...");
        const submitRes = await fetch(`${baseUrl}/api/stores`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Verification Script Store",
                description: "Created by automated script",
                products: ["Test Product"],
                address: "123 Test St",
                city: "Test City",
                province: "ON",
                latitude: "43.6532",
                longitude: "-79.3832",
                category: "food"
            })
        });

        if (!submitRes.ok) {
            console.error("Submission failed:", await submitRes.text());
            process.exit(1);
        }
        const store = await submitRes.json();
        console.log("Store submitted with ID:", store.id);

        console.log("2. Logging in as admin...");
        const loginRes = await fetch(`${baseUrl}/api/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: "blueyellow2024" }) // relying on fallback or seeded user
        });

        if (!loginRes.ok) {
            // Try with username
            console.log("Retrying login with username...");
            const loginRes2 = await fetch(`${baseUrl}/api/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: "admin", password: "blueyellow2024" })
            });
            if (!loginRes2.ok) {
                console.error("Login failed:", await loginRes2.text());
                process.exit(1);
            }
            var loginData = await loginRes2.json();
        } else {
            var loginData = await loginRes.json();
        }

        const sessionId = loginData.sessionId;
        console.log("Logged in, sessionId:", sessionId);

        console.log("3. Approving store...");
        const approveRes = await fetch(`${baseUrl}/api/admin/stores/${store.id}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "x-admin-session": sessionId
            },
            body: JSON.stringify({ status: "approved" })
        });

        if (!approveRes.ok) {
            console.error("Approval failed:", await approveRes.text());
            process.exit(1);
        }
        console.log("Store approved.");

        console.log("4. Verifying store is public...");
        const publicRes = await fetch(`${baseUrl}/api/stores`);
        const publicStores = await publicRes.json();

        const found = publicStores.find(s => s.id === store.id || s.id === String(store.id));

        if (found) {
            console.log("SUCCESS: Store found in public list!");
            console.log("Store details:", found);
        } else {
            console.error("FAILURE: Store NOT found in public list.");
            console.log("Public stores count:", publicStores.length);
        }

    } catch (err) {
        console.error("Verification error:", err);
        process.exit(1);
    }
}

verify();
