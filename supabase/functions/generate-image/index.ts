import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, sagaId, partKey, title } = await req.json();

    // Context descriptions for each part
    const partDescriptions: Record<string, string> = {
      'bild_inledning': 'början av sagan, där karaktärerna och platsen presenteras',
      'bild_huvuddel': 'mitten av sagan, där det spännande händer',
      'bild_avslutning': 'slutet av sagan, där allt löser sig'
    };

    const partContext = partDescriptions[partKey] || 'en scen ur sagan';

    const prompt = `Barnteckningsstil illustration för en saga med titeln "${title}". 
Detta är ${partContext}.
Scen: ${text}
Stil: Enkel tecknad bild i mjuka pastellfärger, vänlig och barnvänlig, ingen text i bilden, vit bakgrund.`;

    console.log('Generating image with prompt:', prompt);

    // Generate image with OpenAI
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI DALL-E error:', error);
      throw new Error(`OpenAI DALL-E API error: ${error}`);
    }

    const data = await response.json();
    const tempImageUrl = data.data[0].url;

    console.log('Generated temporary image URL:', tempImageUrl);

    // Download the image
    const imageResponse = await fetch(tempImageUrl);
    const imageBlob = await imageResponse.blob();

    // Upload to Supabase Storage
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const fileName = `${sagaId}/${partKey}.png`;

    const { error: uploadError } = await supabase.storage
      .from('saga-bilder')
      .upload(fileName, imageBlob, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('saga-bilder')
      .getPublicUrl(fileName);

    console.log('Saved image to storage:', publicUrl);

    return new Response(JSON.stringify({ imageUrl: publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-image function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
