import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // Debug output - Remove in production after verifying
    console.log("Checking ENV vars...");
    // DO NOT LOG THE ACTUAL VALUES IN PRODUCTION LOGS for security, just presence
    console.log("SUPABASE_URL exists:", !!process.env.SUPABASE_URL);
    console.log("SUPABASE_SERVICE_ROLE_KEY exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing Supabase credentials");
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Query 'locations' table
        const { data, error } = await supabase
            .from('locations')
            .select('*');

        if (error) throw error;

        return res.status(200).json({ data });
    } catch (error) {
        console.error("API Error:", error);
        return res.status(500).json({
            error: error.message,
            details: "Check server logs for env var status"
        });
    }
}
