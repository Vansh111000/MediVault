const { GoogleGenAI } = require('@google/genai');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const extractLetterheadText = async (req, res, next) => {
  try {
    const { image, mimeType } = req.body || {};
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
      return errorResponse(res, 400, 'Upload a JPEG, PNG, or WebP image.');
    }
    if (typeof image !== 'string' || !image || image.length > 5_500_000) {
      return errorResponse(res, 400, 'Image is missing or exceeds the 4 MB limit.');
    }
    if (!process.env.GEMINI_API_KEY) {
      return errorResponse(res, 503, 'Gemini AI is not configured on the server.');
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.interactions.create({
      model: "gemini-3.6-flash",
      input: [{type: "text", text:"Extract text of prescriptions, Give answer without any aestricks and it should be concise and less token consuming."},
        {type:"image", data: image , mime_type: mimeType}
      ],
    });
    const text = response.output_text;
    if (!text) return errorResponse(res, 422, 'No readable text was found. Try a clearer image.');
    return successResponse(res, 200, 'Letterhead text extracted', { text });
  } catch (error) {
    if (error.status) return errorResponse(res, error.status, error.message);
    next(error);
  }
};

module.exports = { extractLetterheadText };
