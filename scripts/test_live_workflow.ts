
import fetch from "node-fetch"; // Assuming node-fetch logic is available or native fetch in tsx

async function run() {
    const BASE_URL = "http://localhost:3000"; // Assuming dev port
    const cookieJar: any = {};

    console.log("1. Logging in as Admin...");
    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password: "admin" })
    });

    if (!loginRes.ok) {
        console.error("Login failed:", await loginRes.text());
        return;
    }

    const loginData = await loginRes.json();
    const sessionId = loginData.sessionId;
    console.log("Logged in. Session ID:", sessionId);

    console.log("2. Creating Test Store...");
    const createRes = await fetch(`${BASE_URL}/api/stores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Live Test Store Parsed",
            description: "Testing parsing live",
            products: ["pasta, pesto, sauce, wine"], // Single string in array? Wait, Schema allows array of strings. 
            // If user types "pasta, pesto" in a text input, frontend probably handled it.
            // But let's assume raw input was split by frontend OR sent as single string if that's the bug.
            // StoreCard fix handles array of strings where some strings contain commas.
            // So input: ["pasta, pesto, sauce, wine"] (1 element).
            address: "123 Live St, Toronto, ON",
            city: "Toronto",
            province: "Ontario",
            latitude: "43.71",
            longitude: "-79.41",
            category: "food",
            images: [],
            website: "http://testlive.com",
            email: "testlive@test.com"
        })
    });

    if (!createRes.ok) {
        console.error("Create failed:", await createRes.text());
        return;
    }

    const store = await createRes.json();
    console.log("Store Created. ID:", store.id);

    console.log("3. Approving Store...");
    const approveRes = await fetch(`${BASE_URL}/api/admin/stores/${store.id}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "x-admin-session": sessionId
        },
        body: JSON.stringify({ status: "approved" })
    });

    if (!approveRes.ok) {
        console.error("Approval failed:", await approveRes.text());
        return;
    }
    console.log("Store Approved.");

    console.log("4. Verifying Public API...");
    const publicRes = await fetch(`${BASE_URL}/api/stores`);
    const publicStores = await publicRes.json();
    const myStore = publicStores.find((s: any) => s.id === store.id);

    if (myStore) {
        console.log("Found Store in Public API!");
        console.log("Products:", myStore.products);
        console.log("Test COMPLETE. Store is live.");
    } else {
        console.error("Store not found in public API!");
    }
}

run().catch(console.error);
