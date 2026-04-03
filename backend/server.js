import express from 'express';
import cors from 'cors';
import multer from 'multer';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Setup uploads folder
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const upload = multer({ dest: 'uploads/' });

// Database setup
let db;
async function initializeDb() {
  db = await open({
    filename: path.join(__dirname, 'glaucoma-data.sqlite'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patientId TEXT NOT NULL,
      riskLevel TEXT NOT NULL,
      confidenceScore REAL NOT NULL,
      eye TEXT NOT NULL DEFAULT 'left',
      resultText TEXT,
      recommendation TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration: Add eye column if it doesn't exist
  try {
    const columns = await db.all("PRAGMA table_info(scans)");
    const eyeColumnExists = columns.some(col => col.name === 'eye');
    if (!eyeColumnExists) {
      await db.exec("ALTER TABLE scans ADD COLUMN eye TEXT NOT NULL DEFAULT 'left'");
      console.log('Added eye column to scans table');
    }
  } catch (err) {
    console.error('Error during migration:', err);
  }

  console.log('Database initialized');
}

// POST predict
app.post('/predict', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const { eye = 'left' } = req.body;

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock AI Prediction
    const score = Math.floor(Math.random() * 85) + 10;
    
    let riskLevel = 'Low Risk';
    let resultText = 'No significant signs of glaucoma detected.';
    let recommendation = 'Routine annual check-up recommended.';
    
    if (score >= 70) {
      riskLevel = 'High Risk';
      resultText = 'Significant indicators of glaucoma detected. Immediate consultation needed.';
      recommendation = 'Urgent referral to an ophthalmologist for comprehensive evaluation.';
    } else if (score >= 40) {
      riskLevel = 'Moderate Risk';
      resultText = 'Some suspicious structural changes noted in the optic nerve head.';
      recommendation = 'Schedule a follow-up exam within 3 months with a specialist.';
    }

    const patientId = `PID-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    const result = await db.run(
      `INSERT INTO scans (patientId, riskLevel, confidenceScore, eye, resultText, recommendation)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patientId, riskLevel, score, eye, resultText, recommendation]
    );

    res.json({
      success: true,
      data: {
        id: result.lastID,
        patientId,
        riskLevel,
        confidenceScore: score,
        eye,
        resultText,
        recommendation,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

// GET history
app.get('/history', async (req, res) => {
  try {
    const scans = await db.all('SELECT * FROM scans ORDER BY createdAt DESC');
    res.json({ success: true, data: scans });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// GET report
app.get('/report/:id', async (req, res) => {
  try {
    const scan = await db.get('SELECT * FROM scans WHERE id = ?', [req.params.id]);
    if (!scan) return res.status(404).json({ error: 'Report not found' });
    res.json({ success: true, data: scan });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

initializeDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
});
