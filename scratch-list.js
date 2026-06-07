const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://tmogcconkkhkjqwjxphl.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtb2djY29ua2toa2pxd2p4cGhsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk3MzUxOSwiZXhwIjoyMDk1NTQ5NTE5fQ.3ucmU-daMOamboXy5ZOX04azaeyBc40J-5FOilRpbtQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  }
})

async function run() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
  
  if (error) {
    console.error('Error fetching profiles:', error)
    return
  }
  console.log('Current profiles:', data)
}

run()
