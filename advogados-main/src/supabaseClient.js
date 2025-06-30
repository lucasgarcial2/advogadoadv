// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://urzvhdruscvwxrlxxwan.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyenZoZHJ1c2N2d3hybHh4d2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk4MjQwOTYsImV4cCI6MjA0NTQwMDA5Nn0.889na4plr5y2c3nnZmK4Q6fXeA8Co6JS6_as7TAHZSM';

export const supabase = createClient(supabaseUrl, supabaseKey);
