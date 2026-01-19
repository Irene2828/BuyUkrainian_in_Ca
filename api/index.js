import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: 'Missing Supabase credentials' })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    try {
        // Replace 'your_table' with your actual table name
        // Using 'locations' to verify actual project data
        const { data, error } = await supabase.from('locations').select('*')
        if (error) return res.status(500).json({ error: error.message })

        // Return all rows
        res.status(200).json({ rows: data })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
