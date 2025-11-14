import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://psrqspccqshiswwdejvw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzcnFzcGNjcXNoaXN3d2RlanZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MzkwNTgsImV4cCI6MjA3ODMxNTA1OH0.IxpXsjj7e41uH6wQEYUAvofDe8S73hspI916Wk_ZhGY'

export const supabase = createClient(supabaseUrl, supabaseKey)