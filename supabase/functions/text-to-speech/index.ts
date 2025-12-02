import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Swedish voices from ElevenLabs
const VOICES = {
  sarah: 'EXAVITQu4vr4xnSDxMaL', // Sarah - female, child-friendly
  freya: 'jsCqWAovK2LkecY7zXl4', // Freya - female, child-friendly
  adam: 'pNInz6obpgDQGcFmaJgB', // Adam - male
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key
    if (!elevenLabsApiKey) {
      console.error('ELEVENLABS_API_KEY is not configured');
      throw new Error('Text-to-speech service is not configured');
    }

    const { text, voiceId } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    let selectedVoiceId = VOICES.sarah;
    if (voiceId) {
      // Allow both keys ("sara", "freya", "adam") and raw ElevenLabs IDs
      const key = voiceId as keyof typeof VOICES;
      if (VOICES[key]) {
        selectedVoiceId = VOICES[key];
      } else {
        selectedVoiceId = voiceId; // fallback: assume caller passed a raw voice ID
      }
    }
    console.log('Using voice:', selectedVoiceId, 'requested:', voiceId);

    // Add pauses between sections for better narration flow
    // ElevenLabs processes line breaks as natural pauses
    const formattedText = text
      .replace(/\n\n/g, '\n\n\n') // Triple line breaks for section pauses
      .trim();

    console.log('Generating speech for text length:', text.length);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey!,
        },
        body: JSON.stringify({
          text: formattedText,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.85,
            similarity_boost: 0.92,
            style: 0.15,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs error:', error);
      throw new Error(`ElevenLabs API error: ${error}`);
    }

    // Convert audio buffer to base64
    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );

    console.log('Generated audio, base64 length:', base64Audio.length);

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
