
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
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { image } = await req.json();

    if (!image) {
      throw new Error('No image provided');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that extracts expense information from receipts and bills. 
            Analyze the image and extract the following information:
            - amount: The total amount (number only, no currency symbols)
            - category: One of these categories: investment, food, transport, shopping, loan, medical, others
            - date: Date in YYYY-MM-DD format (if not found, use today's date)
            - description: Brief description of the expense
            
            Return the data in valid JSON format only. If you cannot extract the amount, return an error.
            Categories mapping:
            - food/restaurant/dining = food
            - gas/fuel/taxi/uber/transport = transport
            - shopping/retail/clothes/electronics = shopping
            - medical/pharmacy/hospital/doctor = medical
            - investment/stocks/mutual funds = investment
            - loan/EMI/credit = loan
            - everything else = others`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract expense details from this receipt/bill image. Return only valid JSON with amount, category, date, and description fields.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${image}`
                }
              }
            ]
          }
        ],
        max_tokens: 300,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    // Try to parse the JSON response
    let extractedData;
    try {
      extractedData = JSON.parse(content);
    } catch (e) {
      // If JSON parsing fails, try to extract data using regex or return default
      console.error('Failed to parse AI response as JSON:', content);
      throw new Error('AI could not extract expense data from the image. Please try with a clearer image.');
    }

    // Validate required fields
    if (!extractedData.amount || isNaN(parseFloat(extractedData.amount))) {
      throw new Error('Could not extract a valid amount from the image');
    }

    // Set defaults if missing
    const result = {
      amount: extractedData.amount,
      category: extractedData.category || 'others',
      date: extractedData.date || new Date().toISOString().split('T')[0],
      description: extractedData.description || 'Expense from image'
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-expense-image function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to process image' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
