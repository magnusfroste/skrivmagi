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

    // Get image provider setting
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const { data: settings } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'image_provider')
      .single();

    const provider = settings?.value || 'dalle3';
    
    console.log('Using provider:', provider);

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

    let imageBlob: Blob;

    if (provider === 'imagen_direct') {
      // Use Google Imagen API directly with user's API key
      const { data: keyData } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'gemini_api_key')
        .single();

      if (!keyData?.value) {
        throw new Error('Gemini API key not configured');
      }

      console.log('Using Imagen 4.0 with user API key');
      
      // Call Google's Generative Language API for image generation
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:generateImages?key=${keyData.value}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: prompt,
            number_of_images: 1,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Imagen API error:', response.status, errorText);
        throw new Error(`Imagen API error: ${errorText}`);
      }

      const data = await response.json();
      const base64Image = data.generatedImages?.[0]?.image;
      
      if (!base64Image) {
        throw new Error('No image returned from Imagen');
      }

      // Convert base64 to blob
      const binaryString = atob(base64Image);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      imageBlob = new Blob([bytes], { type: 'image/png' });
      
      console.log('Generated image with Imagen 4.0');
    } else if (provider === 'gemini_direct' || provider === 'lovable_ai') {
      // Use Lovable AI Gateway with Google Gemini
      const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
      if (!lovableApiKey) {
        throw new Error('LOVABLE_API_KEY not configured');
      }

      // Use latest Gemini image model
      const model = provider === 'gemini_direct' 
        ? 'google/gemini-3-pro-image-preview' 
        : 'google/gemini-2.5-flash-image-preview';
      
      console.log('Using Lovable AI with model:', model);
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{
            role: 'user',
            content: prompt
          }],
          modalities: ['image', 'text']
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Lovable AI error:', error);
        throw new Error(`Lovable AI API error: ${error}`);
      }

      const data = await response.json();
      const base64Image = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (!base64Image) {
        throw new Error('No image returned from Lovable AI');
      }

      // Convert base64 to blob
      const base64Data = base64Image.split(',')[1] || base64Image.replace(/^data:image\/\w+;base64,/, '');
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      imageBlob = new Blob([bytes], { type: 'image/png' });
      
      console.log('Generated image with Lovable AI using', model);
    } else {
      // Use DALL-E 3
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
      imageBlob = await imageResponse.blob();
      
      console.log('Downloaded DALL-E image');
    }

    // Upload to Supabase Storage
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
