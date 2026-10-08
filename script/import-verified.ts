#!/usr/bin/env tsx

import { nanoid } from "nanoid";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

async function runImport() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Missing SUPABASE credentials in env variables.");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Read JSON
    const dataPath = path.resolve(process.cwd(), "stores-verified.json");
    const fileContent = fs.readFileSync(dataPath, "utf-8");
    const json = JSON.parse(fileContent);

    // Flatten regions
    let allVerified = [];
    for (const region of Object.keys(json.regions)) {
        allVerified = allVerified.concat(json.regions[region]);
    }

    console.log(`Loaded ${allVerified.length} total stores from JSON.`);

    // 1. Drop borderline entries
    const filteredStores = allVerified.filter(store => {
        if (store.evidence && store.evidence.toLowerCase().includes("borderline")) {
            console.log(`Skipping borderline store: ${store.name} (${store.city})`);
            return false;
        }
        return true;
    });

    console.log(`Remaining after dropping borderline: ${filteredStores.length} stores.`);

    // 2. Fetch existing to dedupe
    const { data: existingStores, error: fetchErr } = await supabase.from('stores').select('*');
    if (fetchErr) {
        throw new Error(`Error fetching existing stores: ${fetchErr.message}`);
    }

    const toInsert = [];
    const toDeleteIds = [];

    for (const store of filteredStores) {
        const matchingExisting = existingStores.find(
            e => e.name.toLowerCase() === store.name.toLowerCase() && 
                 e.address.toLowerCase() === store.address.toLowerCase()
        );

        if (matchingExisting) {
            console.log(`Found duplicate for ${store.name} at ${store.address}. Preparing to overwrite.`);
            toDeleteIds.push(matchingExisting.id);
        }

        toInsert.push({
            id: nanoid(),
            name: store.name,
            description: store.description || "",
            products: store.products || [],
            address: store.address,
            city: store.city,
            province: store.province,
            latitude: store.latitude,
            longitude: store.longitude,
            category: store.category || "other",
            website: store.website || "",
            status: "approved",
            approved_at: new Date().toISOString(),
            is_open: true,
            images: [],
            email: ""
        });
    }

    if (toDeleteIds.length > 0) {
        console.log(`Deleting ${toDeleteIds.length} old duplicate records...`);
        const { error: delErr } = await supabase.from('stores').delete().in('id', toDeleteIds);
        if (delErr) {
            throw new Error(`Error deleting duplicates: ${delErr.message}`);
        }
    }

    console.log(`Inserting ${toInsert.length} verified stores...`);
    const { data: inserted, error: insErr } = await supabase.from('stores').insert(toInsert).select();

    if (insErr) {
        throw new Error(`Error inserting stores: ${insErr.message}`);
    }

    console.log(`✅ Successfully imported ${inserted?.length || 0} stores!`);
}

runImport().catch(err => {
    console.error("❌ Import failed:", err);
    process.exit(1);
});
