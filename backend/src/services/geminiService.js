import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

/**
 * Parses receipt/bill image using Gemini 3.8 Flash or smart fallback
 */
export async function parseBillWithGemini(filePath, mimeType = 'image/jpeg') {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('YOUR_GEMINI_API_KEY')) {
    console.log('No GEMINI_API_KEY configured. Utilizing Smart Bill Mock Simulator.');
    return generateSmartMockScan(filePath);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    const imageBytes = fs.readFileSync(filePath);
    const base64Data = imageBytes.toString('base64');

    const prompt = `
You are an expert expense bill and receipt parsing engine for hostel students and friends.
Analyze this receipt image carefully and extract all information accurately.
Return ONLY a valid, parseable JSON object matching this exact schema:

{
  "merchantName": "Store or Restaurant Name",
  "date": "YYYY-MM-DD",
  "category": "Food" | "Groceries" | "Rent" | "Utilities" | "Travel" | "Entertainment" | "Other",
  "items": [
    {
      "name": "Item Description",
      "quantity": 1,
      "price": 100.0,
      "totalPrice": 100.0
    }
  ],
  "subtotal": 100.0,
  "tax": 5.0,
  "totalAmount": 105.0,
  "notes": "Brief summary of bill"
}

Important Instructions:
- Output ONLY the raw JSON object, without any markdown formatting or code fences.
- All numbers must be numeric, not strings.
- If total amount is unclear, sum the item total prices and tax.
- Date format should be YYYY-MM-DD if recognizable; otherwise use today's date (${new Date().toISOString().split('T')[0]}).
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: base64Data
              }
            },
            {
              text: prompt
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    let rawText = response.text || '';
    // Strip markdown code fences if model returned them
    rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(rawText);

    // Validate and clean extracted data
    const cleaned = {
      merchantName: parsed.merchantName || 'Scanned Merchant',
      date: parsed.date || new Date().toISOString().split('T')[0],
      category: parsed.category || 'Food',
      items: Array.isArray(parsed.items) && parsed.items.length > 0 
        ? parsed.items.map(it => ({
            name: it.name || 'Item',
            quantity: Number(it.quantity) || 1,
            price: Number(it.price) || 0,
            totalPrice: Number(it.totalPrice) || (Number(it.price) || 0) * (Number(it.quantity) || 1)
          }))
        : [
            {
              name: 'General Bill Item',
              quantity: 1,
              price: Number(parsed.totalAmount) || 0,
              totalPrice: Number(parsed.totalAmount) || 0
            }
          ],
      subtotal: Number(parsed.subtotal) || Number(parsed.totalAmount) || 0,
      tax: Number(parsed.tax) || 0,
      totalAmount: Number(parsed.totalAmount) || 0,
      notes: parsed.notes || `Scanned receipt from ${parsed.merchantName || 'merchant'}`
    };

    return {
      success: true,
      source: 'gemini-3.8-flash',
      data: cleaned,
      message: 'Bill successfully parsed using Gemini 3.8 Flash AI.'
    };
  } catch (error) {
    console.warn('Gemini OCR API error, falling back to smart simulator:', error.message);
    const mock = generateSmartMockScan(filePath);
    return {
      ...mock,
      warning: `Gemini API call encountered: ${error.message}. Loaded sample extraction for seamless review.`
    };
  }
}

/**
 * Smart mock scanner for offline testing or when GEMINI_API_KEY is not yet added.
 */
function generateSmartMockScan(filePath) {
  // Preset hostel-friendly mock bills
  const presets = [
    {
      merchantName: "Campus Canteen & Cafe 304",
      date: new Date().toISOString().split('T')[0],
      category: "Food",
      items: [
        { name: "Special Paneer Butter Masala", quantity: 1, price: 220, totalPrice: 220 },
        { name: "Butter Tandoori Roti (x4)", quantity: 4, price: 25, totalPrice: 100 },
        { name: "Jeera Fried Rice", quantity: 1, price: 140, totalPrice: 140 },
        { name: "Fresh Lime Soda (x2)", quantity: 2, price: 50, totalPrice: 100 }
      ],
      subtotal: 560,
      tax: 28,
      totalAmount: 588,
      notes: "Dinner bill scanned from canteen receipt"
    },
    {
      merchantName: "Campus Mart & Stationery",
      date: new Date().toISOString().split('T')[0],
      category: "Groceries",
      items: [
        { name: "A4 Project Assignment Sheets (x2)", quantity: 2, price: 80, totalPrice: 160 },
        { name: "Classmate Notebooks (Pack of 3)", quantity: 1, price: 210, totalPrice: 210 },
        { name: "Highlighters & Sticky Notes", quantity: 1, price: 120, totalPrice: 120 },
        { name: "Hostel Detergent & Handwash", quantity: 1, price: 180, totalPrice: 180 }
      ],
      subtotal: 670,
      tax: 0,
      totalAmount: 670,
      notes: "Midsem study supplies & room cleaning restock"
    }
  ];

  // Pick one preset deterministically
  const selected = presets[0];

  return {
    success: true,
    source: 'smart-simulator',
    data: selected,
    message: 'Scanned via Smart Mock Parser. Add GEMINI_API_KEY in backend/.env for live Gemini 3.8 Flash AI.'
  };
}
