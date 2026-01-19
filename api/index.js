import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
    // Read env vars here, inside the function
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Debug logs to confirm
    console.log('SUPABASE_URL exists:', !!supabaseUrl)
    console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseKey)

    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: 'Missing Supabase credentials. Check Vercel env vars.' })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    try {
        // Keep 'locations' so user actually sees their data
        const { data, error } = await supabase.from('locations').select('*')
        if (error) return res.status(500).json({ error: error.message })
        res.status(200).json({ data })
    } catch (err) {
        console.error('Unexpected error:', err)
        res.status(500).json({ error: err.message })
    }
}
