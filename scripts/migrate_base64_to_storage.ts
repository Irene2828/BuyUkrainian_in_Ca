import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import 'dotenv/config'; // Make sure env vars are loaded when running script from CLI
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { stores } from './shared/schema.js';

const { Pool } = pkg;

// Custom uploader bypassing missing locally-installed SDKs
async function uploadBase64ToStorage(base64String: string, imageId: string): Promise<string | null> {
    if (base64String.startsWith('http')) return base64String;

    const match = base64String.match(/^data:image\/(png|jpeg|webp|jpg);base64,(.+)$/);
    if (!match) return null;

    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, "base64");
    const filename = `${imageId}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !serviceKey) return null;

    const url = `${supabaseUrl}/storage/v1/object/store-images/${filename}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${serviceKey}`,
                "Content-Type": `image/${match[1]}`,
                "Cache-Control": "3600",
                "x-upsert": "false"
            },
            body: buffer
        });

        if (!response.ok) {
            console.error(`❌ Upload failed: ${response.status}`);
            return null;
        }
        return `${supabaseUrl}/storage/v1/object/public/store-images/${filename}`;
    } catch (err) {
        console.error(`❌ Exception during upload:`, err);
        return null;
    }
}

async function runMigration() {
    console.log("🚀 Starting Storage Migration Script...");

    if (!process.env.DATABASE_URL) {
        console.error("Missing DATABASE_URL");
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });
    const db = drizzle(pool);

    // Fetch only stores that contain data uris
    const allStores = await db.select().from(stores);
    console.log(`Found ${allStores.length} total stores. Scanning for Base64 payloads...`);

    let count = 0;

    for (const store of allStores) {
        let needsUpdate = false;
        let newImage = store.image;
        let newImages = [...(store.images || [])];

        if (store.image && store.image.startsWith('data:image')) {
            console.log(`[${store.id}] Primary image is Base64... Uploading to Bucket...`);
            const url = await uploadBase64ToStorage(store.image, `primary-${store.id}`);
            if (url) {
                newImage = url;
                needsUpdate = true;
            }
        }

        for (let i = 0; i < newImages.length; i++) {
            if (newImages[i] && newImages[i].startsWith('data:image')) {
                console.log(`[${store.id}] Gallery image ${i} is Base64... Uploading...`);
                const url = await uploadBase64ToStorage(newImages[i], `gallery-${store.id}-${i}`);
                if (url) {
                    newImages[i] = url;
                    needsUpdate = true;
                }
            }
        }

        if (needsUpdate) {
            try {
                await db.update(stores).set({
                    image: newImage,
                    images: newImages
                }).where(eq(stores.id, store.id));
                console.log(`✅ [${store.id}] Successfully migrated and saved to DB!`);
                count++;
            } catch (e: any) {
                console.error(`❌ [${store.id}] DB update failed: ${e.message}`);
            }
        }
    }

    console.log(`\n🎉 Migration complete! ${count} stores updated to pure URLs. Database Egress permanently reduced!`);
    process.exit(0);
}

runMigration().catch(console.error);
