import {createClient} from '@supabase/supabase-js';
// Public browser credentials supplied by the project owner. RLS is mandatory.
export const supabaseUrl=import.meta.env.VITE_SUPABASE_URL||'https://plpvygpgymfwwkflauaa.supabase.co';
const publishable=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_kcF8LvYdGcCyjt3G2UNugQ_3OoIhDe6';
export const supabase=createClient(supabaseUrl,publishable,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
