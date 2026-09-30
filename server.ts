import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing with generous limit for high-res ID camera photos
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Orderfix Police Verification & Property Engine' });
});

/**
 * AI-Powered ID Card Scanner Endpoint (Aadhaar, Passport, Voter ID, Driving License)
 * Powered by Gemini 3.8 Flash
 */
app.post('/api/extract-id', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'No image provided. Please upload or capture an ID document.'
      });
    }

    // Clean base64 string if data URL prefix exists
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not configured. Falling back to structured heuristic extractor.');
      return res.json({
        success: false,
        isFallback: true,
        error: 'GEMINI_API_KEY not configured on server.',
        message: 'Please configure GEMINI_API_KEY in environment or use manual entry / test presets.'
      });
    }

    const ai = new GoogleGenAI();

    const prompt = `You are an expert optical document recognition and KYC data extraction engine for Indian hotels, guest houses, and homestays complying with local police verification rules (Form C and Daily Guest Register).
Analyze this uploaded Indian Government ID card (Aadhaar Card, Indian Passport, Election Commission Voter ID, or Driving License).

Extract all readable information and respond with ONLY a valid, raw JSON object (no markdown quotes, no triple backticks, no extra text).
JSON format:
{
  "guestName": "Full name of the person in Title Case",
  "idType": "aadhaar" or "passport" or "voter_id" or "driving_license" or "other",
  "idNumber": "Document ID number (e.g., 12-digit Aadhaar, Passport number, Voter EPIC, Driving License number)",
  "gender": "Male" or "Female" or "Other",
  "age": number or null,
  "dob": "YYYY-MM-DD" or "DD/MM/YYYY" or null,
  "address": "Full permanent address including village/city, district, state and pin code",
  "nationality": "Indian" or specific country,
  "phone": "Mobile number if printed on document or null"
}

If any field is unclear or missing, provide your best deduction or null. Do not invent completely fake names; accurately transcribe what is visible on the card.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64
              }
            },
            {
              text: prompt
            }
          ]
        }
      ]
    });

    const responseText = response.text || '';
    
    // Parse JSON safely
    let parsedData = {};
    try {
      const cleanJson = responseText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      parsedData = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error('Failed to parse Gemini JSON output:', responseText, parseErr);
      return res.json({
        success: false,
        rawText: responseText,
        error: 'Could not structure ID information automatically. Please review manually.'
      });
    }

    return res.json({
      success: true,
      data: parsedData,
      rawOutput: responseText
    });
  } catch (err: any) {
    console.error('ID Extraction API error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Error processing document image'
    });
  }
});

/**
 * Police Dispatch Log recording
 */
app.post('/api/police-dispatch-log', (req, res) => {
  const { hotelName, guestCount, dispatchMethod, timestamp, thana } = req.body;
  console.log(`[POLICE DISPATCH] ${timestamp} - ${hotelName} reported ${guestCount} guests to ${thana} via ${dispatchMethod}`);
  res.json({ success: true, loggedAt: new Date().toISOString() });
});

// Mount Vite in development or serve static in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: Number(PORT) },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Orderfix Server & Police Portal running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
