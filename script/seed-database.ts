#!/usr/bin/env tsx

// Environment variables should be set before running this script.
// e.g.: source .env.local && tsx script/seed-database.ts

import { nanoid } from "nanoid";
import { createClient } from "@supabase/supabase-js";

const seedData = [

    {
        name: 'Yummy Market',
        description: 'European grocery store with a vast selection of Ukrainian imported goods.',
        products: ['Roshen Chocolates', 'Kvas', 'Buckwheat', 'Preserves'],
        address: '1390 Major Mackenzie Dr W, Maple, ON L6A 4H6',
        city: 'Maple',
        province: 'Ontario',
        lat: 43.8755,
        lng: -79.4964,
        category: 'clothes',
        status: 'approved',
        is_open: true,
        approved_at: new Date().toISOString(),
        images: ['https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=800']
    },

    {
        name: 'Ukrainian Gift Shop',
        description: 'Traditional Ukrainian gifts, crafts, and cultural items.',
        products: ['Embroidery', 'Pottery', 'Folk Art'],
        address: '405 The West Mall, Etobicoke, ON M9C 5J1',
        city: 'Etobicoke',
        province: 'Ontario',
        lat: 43.6441,
        lng: -79.5653,
        category: 'other',
        status: 'approved',
        is_open: true,
        approved_at: new Date().toISOString(),
        images: ['https://images.unsplash.com/photo-1616687472097-47b744421689?auto=format&fit=crop&q=80&w=800']
    },
];

async function seedDatabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        const missing = [];
        if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
        if (!supabaseKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
        throw new Error(`Configuration Error: Missing API credentials: ${missing.join(", ")}`);
    }

    console.log("🌱 Connecting to Supabase...");
    // URL logging removed for Zero-Visibility Policy

    const supabase = createClient(supabaseUrl, supabaseKey);

    // First, check if table is already populated
    const { data: existing, error: checkError } = await supabase
        .from('stores') // Updated table name
        .select('id')
        .limit(1);

    if (checkError) {
        console.error("❌ Error checking existing data:", checkError);
        process.exit(1);
    }

    if (existing && existing.length > 0) {
        console.log("⚠️  Warning: 'stores' table already contains data.");
        console.log("   To avoid duplicates, delete existing data first or modify the script.");
        console.log("");
        console.log("   You can clear the table in Supabase SQL Editor with:");
        console.log("   DELETE FROM stores;");
        console.log("");
        // We will just exit to be safe
        console.log("   Exiting to prevent duplicates.");
        process.exit(0);
    }

    console.log(`🌱 Seeding ${seedData.length} Ukrainian stores...`);

    // Format data and add IDs
    const formattedData = seedData.map(store => {
        const { lat, lng, ...rest } = store;
        return {
            ...rest,
            id: nanoid(),
            latitude: lat,
            longitude: lng,
        };
    });

    const { data, error } = await supabase
        .from('stores') // Updated table name
        .insert(formattedData)
        .select();

    if (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    }

    console.log(`✅ Successfully seeded ${data?.length || 0} stores!`);
    console.log("");
    console.log("🗺️  Locations added:");
    data?.forEach((store: any, index: number) => {
        console.log(`   ${index + 1}. ${store.name} (${store.city}, ${store.province})`);
    });
    console.log("");
    console.log("🎉 All done! Your map will now display these pins.");
    console.log("   - Refresh http://localhost:5001/map");
    console.log("   - Check your Vercel site");
}

seedDatabase();
