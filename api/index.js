import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client using env vars
// Note: In serverless functions, it's safer to read env vars inside handler or check them, 
// but checking at module level is faster for warm starts.

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Optional debug logs
console.log('SUPABASE_URL exists:', !!supabaseUrl)
console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseKey)

export default async function handler(req, res) {
    try {
        // If env vars are missing, return early inside request flow (safer for logs)
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase credentials. Check Vercel env vars.')
        }

        // Create client freshly or reuse? Reusing globally specific client is better but 
        // for diagnosing, local is fine. Let's use the requested pattern.
        const supabase = createClient(supabaseUrl, supabaseKey)

        console.log('Fetching data from Supabase table...')

        // Using 'locations' table as we know it exists, instead of 'your_table' 
        // to give user instant feedback on success.
        const { data, error } = await supabase.from('locations').select('*')

        if (error) {
            console.error('Supabase error:', error)
            return res.status(500).json({ error: error.message })
        }

        if (!data || data.length === 0) {
            console.log('No data found in table.')
            return res.status(200).json({ message: 'No data found.', data: [] })
        }

        console.log('Data fetched:', data.length, 'rows')
        return res.status(200).json({ data })
    } catch (err) {
        console.error('Unexpected error:', err)
        return res.status(500).json({ error: err.message })
    }
}
