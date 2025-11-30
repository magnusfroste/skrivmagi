import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { del, karaktar, plats, tid, kansla, problem } = await req.json();

    const delMap: Record<string, string> = {
      inledning: 'INLEDNING',
      huvuddel: 'HUVUDDEL',
      avslutning: 'AVSLUTNING'
    };

    const prompt = `Du är en snäll lärare i svenska åk 3. Skriv 1–3 korta, levande meningar på enkel svenska till just denna del av sagan. Använd bara informationen nedan.

Del: ${delMap[del] || del}
${karaktar ? `Karaktär: ${karaktar}` : ''}
${plats ? `Plats: ${plats}` : ''}
${tid ? `Tid/väder: ${tid}` : ''}
${kansla ? `Känsla: ${kansla}` : ''}
${problem ? `Problem: ${problem}` : ''}

Skriv bara meningarna, inget annat.`;

    console.log('Generating text with prompt:', prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Du är en hjälpsam assistent som skriver sagor för barn i årskurs 2-3 på enkel svenska.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI error:', error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    console.log('Generated text:', generatedText);

    return new Response(JSON.stringify({ text: generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-text function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
