import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { parseBillWithGemini } from '../services/geminiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `bill_${Date.now()}_${Math.random().toString(36).substr(2, 6)}${ext}`);
  }
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
}).single('receipt');

export async function scanBill(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file uploaded. Please upload a receipt or bill photo.'
      });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype || 'image/jpeg';
    const receiptUrl = `/uploads/${req.file.filename}`;

    const scanResult = await parseBillWithGemini(filePath, mimeType);

    res.json({
      success: true,
      data: {
        ...scanResult.data,
        receiptUrl,
        source: scanResult.source,
        message: scanResult.message,
        warning: scanResult.warning
      }
    });
  } catch (err) {
    console.error('Bill Scanner Controller Error:', err);
    res.status(500).json({
      success: false,
      error: `Failed to process bill image: ${err.message}`
    });
  }
}
