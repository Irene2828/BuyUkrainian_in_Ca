const http = require('http');

function request(method, path, body, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '127.0.0.1',
            port: 3001,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const json = data ? JSON.parse(data) : {};
                    resolve({ status: res.statusCode, body: json });
                } catch (e) {
                    console.error("Failed to parse JSON:", data);
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function run() {
    console.log("Starting verification flow...");

    // 1. Create Store
    console.log("\n1. Creating Store...");
    const randomLat = 43.7 + (Math.random() * 0.1);
    const randomLng = -79.4 + (Math.random() * 0.1);
    const storeRes = await request('POST', '/api/stores', {
        name: "Verification Store " + Date.now(),
        description: "Auto-generated test store",
        products: ["Test Product"],
        address: "123 Test Ave",
        city: "Test City",
        province: "ON",
        latitude: String(randomLat),
        longitude: String(randomLng),
        category: "food"
    });

    if (storeRes.status !== 201) {
        console.error(`Failed to create store. Status: ${storeRes.status}, Body:`, storeRes.body);
        process.exit(1);
    }
    const storeId = storeRes.body.id;
    console.log("Store created with ID:", storeId);

    // 2. Login as Admin
    console.log("\n2. Logging in as Admin...");
    const loginRes = await request('POST', '/api/admin/login', {
        username: "admin",
        password: "blueyellow2024"
    });

    if (loginRes.status !== 200 || !loginRes.body.success) {
        console.error("Failed to login:", loginRes.body);
        process.exit(1);
    }
    const sessionId = loginRes.body.sessionId;
    console.log("Logged in. Session ID:", sessionId);

    // 3. Approve Store
    console.log("\n3. Approving Store...");
    const approveRes = await request('PATCH', `/api/admin/stores/${storeId}/status`, {
        status: "approved"
    }, {
        'x-admin-session': sessionId
    });

    if (approveRes.status !== 200) {
        console.error("Failed to approve store:", approveRes.body);
        process.exit(1);
    }
    console.log("Store approved successfully.");

    // 4. Verify in Public List
    console.log("\n4. Verifying in Public List...");
    const listRes = await request('GET', '/api/stores');

    if (listRes.status !== 200) {
        console.error("Failed to fetch stores:", listRes.body);
        process.exit(1);
    }

    const found = listRes.body.find(s => s.id === storeId);
    if (found) {
        console.log("SUCCESS: Store found in approved list!");
        console.log("Store details:", found);
        // Check if approvedAt is set (it might be string in JSON)
        if (found.approvedAt) {
            console.log("Store has approvedAt timestamp:", found.approvedAt);
        } else {
            console.error("WARNING: Store missing approvedAt timestamp!");
            process.exit(1);
        }
    } else {
        console.error("FAILURE: Store NOT found in approved list.");
        process.exit(1);
    }
}

run().catch(console.error);
