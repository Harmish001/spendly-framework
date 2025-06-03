
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { transcription } = await req.json();

    if (!transcription) {
      throw new Error('No transcription provided');
    }

    console.log('Processing transcription:', transcription);

    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an AI assistant that extracts expense information from spoken text. 
                Analyze the transcription and extract the following information:
                - amount: The amount mentioned (number only, no currency symbols) - THIS IS MANDATORY
                - category: One of these categories: investment, food, transport, shopping, loan, medical, bill, travel, others (if unclear, use "others")
                - description: Brief description of the expense (if unclear, use a generic description)
                - date: Date in YYYY-MM-DD format (if mentioned, otherwise use today's date)
                
                Return the data in valid JSON format only. Do not wrap the response in markdown code blocks.
                The amount field is mandatory - if you cannot extract a valid amount, return an error.
                
                Categories mapping:
                - food/restaurant/dining/lunch/dinner/breakfast = food
                - gas/fuel/taxi/uber/transport/bus/train = transport
                - shopping/retail/clothes/electronics/grocery = shopping
                - medical/pharmacy/hospital/doctor = medical
                - investment/stocks/mutual funds = investment
                - loan/EMI/credit = loan
                - bill/electricity/water/phone = bill
                - travel/hotel/flight = travel
                - everything else = others
                
                Transcription to process: "${transcription}"
                
                Extract expense details and return only valid JSON with amount (mandatory), category, description, and date fields.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 300,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${errorText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('No response from Gemini');
    }

    console.log('Gemini response:', content);

    // Clean the response by removing markdown code blocks if present
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Try to parse the JSON response
    let extractedData;
    try {
      extractedData = JSON.parse(cleanedContent);
    } catch (e) {
      console.error('Failed to parse JSON:', cleanedContent);
      throw new Error('AI could not extract expense data from the voice input. Please try speaking more clearly.');
    }

    // Validate that we have a valid amount (this is mandatory)
    if (!extractedData.amount || isNaN(parseFloat(extractedData.amount))) {
      throw new Error('Could not extract a valid amount from your voice input. Please try again and clearly state the amount.');
    }

    // Set defaults for optional fields
    const result = {
      amount: parseFloat(extractedData.amount),
      category: extractedData.category || 'others',
      description: extractedData.description || 'Voice expense',
      date: extractedData.date || new Date().toISOString().split('T')[0]
    };

    console.log('Processed expense data:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-voice-expense function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to process voice expense' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
