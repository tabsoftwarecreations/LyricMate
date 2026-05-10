import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://itmkbxwhvovylfzgpmsr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0bWtieHdodm92eWxmemdwbXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzQwNzgsImV4cCI6MjA5MzE1MDA3OH0.XDsAo0ydBs6p2pR1aj15p2diLfpOeraY_p53_zn1kFc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});