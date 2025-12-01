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
    const { del, karaktar, plats, tid, kansla, problem, previousParts } = await req.json();

    const delMap: Record<string, string> = {
      inledning: 'INLEDNING',
      huvuddel: 'HUVUDDEL',
      avslutning: 'AVSLUTNING'
    };

    // Build context from previous parts
    let contextSection = '';
    if (previousParts) {
      if (del === 'huvuddel' && previousParts.inledning) {
        contextSection = `\n\nTIDIGARE I SAGAN (Inledning):\n"${previousParts.inledning}"\n\nFortsätt berättelsen och bygg vidare på det som hänt i inledningen.`;
      } else if (del === 'avslutning') {
        const parts = [];
        if (previousParts.inledning) {
          parts.push(`Inledning: "${previousParts.inledning}"`);
        }
        if (previousParts.huvuddel) {
          parts.push(`Huvuddel: "${previousParts.huvuddel}"`);
        }
        if (parts.length > 0) {
          contextSection = `\n\nTIDIGARE I SAGAN:\n${parts.join('\n\n')}\n\nAvsluta berättelsen på ett passande sätt som knyter ihop sagan.`;
        }
      }
    }

    const prompt = `Du är en snäll lärare i svenska åk 3. Skriv 1–3 korta, levande meningar på enkel svenska till just denna del av sagan. Använd informationen nedan.

Del: ${delMap[del] || del}
${karaktar ? `Karaktär: ${karaktar}` : ''}
${plats ? `Plats: ${plats}` : ''}
${tid ? `Tid/väder: ${tid}` : ''}
${kansla ? `Känsla: ${kansla}` : ''}
${problem ? `Problem: ${problem}` : ''}${contextSection}

Skriv bara meningarna, inget annat. Se till att texten passar ihop med resten av sagan.`;

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
          { role: 'system', content: 'Du är en hjälpsam assistent som skriver sammanhängande sagor för barn i årskurs 2-3 på enkel svenska. Du ser till att varje del av sagan bygger vidare på tidigare delar så att berättelsen blir en sammanhängande helhet.' },
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
