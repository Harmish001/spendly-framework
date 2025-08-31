
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function extractWithOpenAI(image: string) {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('Trying OpenAI for expense extraction...');

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
          - amount: The total amount (number only, no currency symbols) - THIS IS MANDATORY
          - category: One of these categories: investment, food, transport, shopping, loan, medical, others (if unclear, use "others")
          - date: Date in YYYY-MM-DD format (if not found, leave empty)
          - description: Brief description of the expense (if unclear, leave empty)
          
          Return the data in valid JSON format only. Do not wrap the response in markdown code blocks.
          The amount field is mandatory - if you cannot extract a valid amount, return an error.
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
              text: 'Extract expense details from this receipt/bill image. Return only valid JSON with amount (mandatory), category, date, and description fields. Do not use markdown formatting. If category is unclear, use "others". If date or description are unclear, you can leave them empty.'
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
    throw new Error('No response from OpenAI');
  }

  return content;
}

async function extractWithGemini(image: string) {
  if (!geminiApiKey) {
    throw new Error('Gemini API key not configured');
  }

  console.log('Trying Google Gemini for expense extraction...');

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
              text: `You are an AI assistant that extracts expense information from receipts and bills. 
              Analyze the image and extract the following information:
              - amount: The total amount (number only, no currency symbols) - THIS IS MANDATORY
              - category: One of these categories: investment, food, transport, shopping, loan, medical, others (if unclear, use "others")
              - date: Date in YYYY-MM-DD format (if not found, leave empty)
              - description: Brief description of the expense (if unclear, leave empty)
              
              Return the data in valid JSON format only. Do not wrap the response in markdown code blocks.
              The amount field is mandatory - if you cannot extract a valid amount, return an error.
              Categories mapping:
              - food/restaurant/dining = food
              - gas/fuel/taxi/uber/transport = transport
              - shopping/retail/clothes/electronics = shopping
              - medical/pharmacy/hospital/doctor = medical
              - investment/stocks/mutual funds = investment
              - loan/EMI/credit = loan
              - everything else = others
              
              Extract expense details from this receipt/bill image. Return only valid JSON with amount (mandatory), category, date, and description fields.`
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: image
              }
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
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error('No response from Gemini');
  }

  return content;
}

function parseAIResponse(content: string) {
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
    throw new Error('AI could not extract expense data from the image. Please try with a clearer image.');
  }

  // Validate that we have a valid amount (this is mandatory)
  if (!extractedData.amount || isNaN(parseFloat(extractedData.amount))) {
    throw new Error('Could not extract a valid amount from the image. Please try with a clearer image.');
  }

  // Set defaults for optional fields
  return {
    amount: parseFloat(extractedData.amount),
    category: extractedData.category || 'others',
    date: extractedData.date || new Date().toISOString().split('T')[0],
    description: extractedData.description || 'Expense from image'
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();

    if (!image) {
      throw new Error('No image provided');
    }

    let aiResponse;
    let usedProvider = '';

    // Try OpenAI first, then fallback to Gemini
    try {
      if (openAIApiKey) {
        aiResponse = await extractWithOpenAI(image);
        usedProvider = 'OpenAI';
      } else {
        throw new Error('OpenAI not available');
      }
    } catch (openAIError) {
      console.log('OpenAI failed:', openAIError.message);
      
      try {
        if (geminiApiKey) {
          aiResponse = await extractWithGemini(image);
          usedProvider = 'Gemini';
        } else {
          throw new Error('Gemini not available');
        }
      } catch (geminiError) {
        console.log('Gemini failed:', geminiError.message);
        throw new Error('Both OpenAI and Gemini failed to process the image. Please try with a clearer image or check your API keys.');
      }
    }

    console.log(`AI response from ${usedProvider}:`, aiResponse);

    const result = parseAIResponse(aiResponse);

    console.log('Processed expense data:', result);

    return new Response(JSON.stringify({ 
      ...result, 
      provider: usedProvider 
    }), {
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
