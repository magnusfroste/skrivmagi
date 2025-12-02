import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

const ADMIN_EMAIL = 'magnus@froste.eu';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create supabase client with user's JWT to verify identity
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    if (user.email !== ADMIN_EMAIL) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, key, value } = await req.json();

    if (action === 'update') {
      // Validate key is allowed
      const allowedKeys = ['image_provider', 'gemini_api_key'];
      if (!allowedKeys.includes(key)) {
        return new Response(
          JSON.stringify({ error: 'Invalid settings key' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Use service role key to bypass RLS
      const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Check if setting exists
      const { data: existing } = await adminSupabase
        .from('app_settings')
        .select('id')
        .eq('key', key)
        .single();

      if (existing) {
        // Update existing
        const { error: updateError } = await adminSupabase
          .from('app_settings')
          .update({ value, updated_at: new Date().toISOString(), updated_by: user.id })
          .eq('key', key);

        if (updateError) throw updateError;
      } else {
        // Insert new
        const { error: insertError } = await adminSupabase
          .from('app_settings')
          .insert({ key, value, updated_by: user.id });

        if (insertError) throw insertError;
      }

      return new Response(
        JSON.stringify({ success: true }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }), 
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in admin-settings function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
