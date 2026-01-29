#!/usr/bin/env tsx

// Load environment variables
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const seedData = [
    {
        name: 'Kozak Ukrainian Bakery',
        description: 'Authentic Ukrainian breads, pastries, and comfort foods made from scratch.',
        products: ['Borsch', 'Varenyky', 'Sourdough Bread', 'Coffee'],
        address: '5077 Victoria Dr, Vancouver, BC V5P 3T9',
        city: 'Vancouver',
        province: 'British Columbia',
        lat: 49.2333,
        lng: -123.0667,
        category: 'food',
        status: 'approved',
        is_open: true,
        approved_at: new Date().toISOString(),
        images: ['https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800']
    },
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
        name: 'Future Bakery',
        description: 'Family-owned bakery serving traditional Eastern European recipes since 1991.',
        products: ['Rye Bread', 'Poppy Seed Roll', 'Cakes'],
        address: '106 N Queen St, Etobicoke, ON M8Z 2E2',
        city: 'Etobicoke',
        province: 'Ontario',
        lat: 43.6156,
        lng: -79.5572,
        category: 'food',
        status: 'approved',
        is_open: true,
        approved_at: new Date().toISOString(),
        images: ['https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&q=80&w=800']
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
    {
        name: 'Shumka Ukrainian Foods',
        description: 'Edmonton staple for perogies and cabbage rolls.',
        products: ['Perogies', 'Cabbage Rolls', 'Nalysnyky'],
        address: '16520 95 St, Edmonton, AB T5Z 3L2',
        city: 'Edmonton',
        province: 'Alberta',
        lat: 53.6284,
        lng: -113.4909,
        category: 'food',
        status: 'approved',
        is_open: true,
        approved_at: new Date().toISOString(),
        images: ['https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=800']
    },
    {
        name: 'Saskatoon Co-op',
        description: 'Local cooperative featuring local Ukrainian producers.',
        products: ['Sausage', 'Perogies', 'Local Crafts'],
        address: '201 33rd St W, Saskatoon, SK S7L 0V1',
        city: 'Saskatoon',
        province: 'Saskatchewan',
        lat: 52.1465,
        lng: -106.6735,
        category: 'food',
        status: 'approved',
        is_open: true,
        approved_at: new Date().toISOString(),
        images: ['https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=800']
    }
];

async function seedDatabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error("❌ Missing Supabase credentials!");
        console.error("   Make sure .env.local contains:");
        console.error("   - NEXT_PUBLIC_SUPABASE_URL");
        console.error("   - SUPABASE_SERVICE_ROLE_KEY");
        process.exit(1);
    }

    console.log("🌱 Connecting to Supabase...");
    console.log(`📍 URL: ${supabaseUrl}`);

    const supabase = createClient(supabaseUrl, supabaseKey);

    // First, check if table is already populated
    const { data: existing, error: checkError } = await supabase
        .from('locations')
        .select('id')
        .limit(1);

    if (checkError) {
        console.error("❌ Error checking existing data:", checkError);
        process.exit(1);
    }

    if (existing && existing.length > 0) {
        console.log("⚠️  Warning: locations table already contains data.");
        console.log("   To avoid duplicates, delete existing data first or modify the script.");
        console.log("");
        console.log("   You can clear the table in Supabase SQL Editor with:");
        console.log("   DELETE FROM locations;");
        console.log("");
        console.log("   Or continue anyway (will create duplicates)? [y/N]");
        process.exit(0);
    }

    console.log(`🌱 Seeding ${seedData.length} Ukrainian stores...`);

    const { data, error } = await supabase
        .from('locations')
        .insert(seedData)
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
