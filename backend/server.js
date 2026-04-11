import express from 'express';
import cors from 'cors';
import multer from 'multer';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

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
      patientName TEXT,
      patientAge INTEGER,
      patientGender TEXT,
      riskLevel TEXT NOT NULL,
      confidenceScore REAL NOT NULL,
      eye TEXT NOT NULL DEFAULT 'left',
      resultText TEXT,
      recommendation TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration: Add new columns if they don't exist
  try {
    const columns = await db.all("PRAGMA table_info(scans)");
    const columnNames = columns.map(col => col.name);
    
    if (!columnNames.includes('eye')) {
      await db.exec("ALTER TABLE scans ADD COLUMN eye TEXT NOT NULL DEFAULT 'left'");
    }
    if (!columnNames.includes('patientName')) {
      await db.exec("ALTER TABLE scans ADD COLUMN patientName TEXT");
    }
    if (!columnNames.includes('patientAge')) {
      await db.exec("ALTER TABLE scans ADD COLUMN patientAge INTEGER");
    }
    if (!columnNames.includes('patientGender')) {
      await db.exec("ALTER TABLE scans ADD COLUMN patientGender TEXT");
    }
  } catch (err) {
    console.error('Error during migration:', err);
  }

  console.log('Database initialized');
}

// Helper to simulate prediction
async function getPrediction(eye) {
  await new Promise(resolve => setTimeout(resolve, 1000));
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
  return { score, riskLevel, resultText, recommendation };
}

// POST predict
app.post('/predict', upload.fields([
  { name: 'leftEye', maxCount: 1 },
  { name: 'rightEye', maxCount: 1 }
]), async (req, res) => {
  try {
    const { patientId, patientName, patientAge, patientGender } = req.body;
    const files = req.files;

    if (!files.leftEye || !files.rightEye) {
      return res.status(400).json({ error: 'Both left and right eye images are required' });
    }

    const pid = patientId || `PID-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Process both eyes
    const leftResult = await getPrediction('left');
    const rightResult = await getPrediction('right');

    // Save both results
    const leftInsert = await db.run(
      `INSERT INTO scans (patientId, patientName, patientAge, patientGender, riskLevel, confidenceScore, eye, resultText, recommendation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [pid, patientName, patientAge, patientGender, leftResult.riskLevel, leftResult.score, 'left', leftResult.resultText, leftResult.recommendation]
    );

    const rightInsert = await db.run(
      `INSERT INTO scans (patientId, patientName, patientAge, patientGender, riskLevel, confidenceScore, eye, resultText, recommendation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [pid, patientName, patientAge, patientGender, rightResult.riskLevel, rightResult.score, 'right', rightResult.resultText, rightResult.recommendation]
    );

    res.json({
      success: true,
      data: {
        patientId: pid,
        patientName,
        patientAge,
        patientGender,
        leftScanId: leftInsert.lastID,
        rightScanId: rightInsert.lastID,
        results: {
          left: { ...leftResult, id: leftInsert.lastID },
          right: { ...rightResult, id: rightInsert.lastID }
        },
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
