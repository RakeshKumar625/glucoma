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
    if (!columnNames.includes('reasons')) {
      await db.exec("ALTER TABLE scans ADD COLUMN reasons TEXT");
    }
    if (!columnNames.includes('summary')) {
      await db.exec("ALTER TABLE scans ADD COLUMN summary TEXT");
    }
  } catch (err) {
    console.error('Error during migration:', err);
  }

  console.log('Database initialized');
}

// Function to generate dynamic glaucoma report
function getGlaucomaReport(score) {
  let riskLevel = '';
  let reasons = [];
  let summary = '';
  let recommendation = '';
  let resultText = '';

  const lowReasons = [
    "Optic nerve head appears structurally normal",
    "Cup-to-disc ratio within healthy limits",
    "No visible signs of retinal nerve fiber layer thinning",
    "Symmetry observed between both eyes",
    "No abnormal changes in optic disc shape",
    "Neuroretinal rim appears intact and well-defined",
    "No evidence of optic cup enlargement",
    "Retinal blood vessels appear normal in structure",
    "No signs of localized nerve damage detected",
    "Overall retinal appearance within normal parameters"
  ];

  const moderateReasons = [
    "Slight increase in cup-to-disc ratio observed",
    "Mild asymmetry between left and right eye",
    "Early signs of retinal nerve fiber layer thinning",
    "Subtle changes in optic nerve head structure",
    "Possible early deformation of optic disc",
    "Minor irregularities in vascular pattern near optic nerve",
    "Neuroretinal rim shows mild thinning",
    "Localized areas of reduced nerve fiber density suspected",
    "Gradual vertical elongation of optic cup",
    "Early structural imbalance in optic disc region"
  ];

  const highReasons = [
    "Significant enlargement of optic cup detected",
    "Marked thinning of retinal nerve fiber layer (RNFL)",
    "Abnormal optic disc morphology observed",
    "Loss of neuroretinal rim integrity",
    "Increased vertical cup-to-disc ratio",
    "Visible structural damage to optic nerve head",
    "Deep excavation of optic cup",
    "Asymmetry strongly indicative of glaucomatous damage",
    "Pronounced thinning in superior and inferior nerve fiber regions",
    "Distortion in optic disc boundary observed",
    "Evidence of progressive optic nerve degeneration",
    "Irregular contour of neuroretinal rim suggesting damage"
  ];

  const getRandomUnique = (arr, n) => {
    let shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
  };

  if (score < 40) {
    riskLevel = 'Low Risk';
    reasons = getRandomUnique(lowReasons, 2);
    resultText = "No significant indicators of glaucoma detected.";
    summary = "Your eye health appears to be within normal parameters. The structural integrity of the optic nerve is well-maintained, and no significant indicators of glaucoma were detected in this scan. Continued routine monitoring is encouraged to maintain this healthy status.";
    recommendation = 'Routine annual check-up recommended to ensure long-term eye health.';
  } else if (score < 70) {
    riskLevel = 'Moderate Risk';
    reasons = getRandomUnique(moderateReasons, 4);
    resultText = "Subtle structural irregularities detected.";
    summary = "Some subtle changes or irregularities have been identified in the retinal structure. While these signs are not definitive of advanced disease, they warrant careful observation and further clinical correlation. We advise caution and a follow-up assessment to monitor any potential progression.";
    recommendation = 'Schedule a follow-up exam within 3 months with an ophthalmologist for detailed diagnostic tests.';
  } else {
    riskLevel = 'High Risk';
    reasons = getRandomUnique(highReasons, 6);
    resultText = "Significant glaucomatous damage indicators observed.";
    summary = "Urgent: The analysis has detected significant structural changes highly indicative of glaucomatous damage. These findings require immediate medical attention to prevent potential vision loss. Please consult a glaucoma specialist as soon as possible for a comprehensive evaluation and treatment plan.";
    recommendation = 'Obtain an urgent specialist referral. Immediate clinical intervention is strongly advised.';
  }

  return { score, riskLevel, reasons, summary, recommendation, resultText };
}

// Helper to simulate prediction
async function getPrediction(eye) {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Weights for randomization to get a mix of results
  const random = Math.random();
  let score;
  if (random < 0.6) {
    score = Math.floor(Math.random() * 30) + 5; // Low
  } else if (random < 0.85) {
    score = Math.floor(Math.random() * 25) + 40; // Moderate
  } else {
    score = Math.floor(Math.random() * 30) + 70; // High
  }

  return getGlaucomaReport(score);
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
      `INSERT INTO scans (patientId, patientName, patientAge, patientGender, riskLevel, confidenceScore, eye, resultText, recommendation, reasons, summary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pid, patientName, patientAge, patientGender, 
        leftResult.riskLevel, leftResult.score, 'left', 
        leftResult.resultText, leftResult.recommendation, 
        JSON.stringify(leftResult.reasons), leftResult.summary
      ]
    );

    const rightInsert = await db.run(
      `INSERT INTO scans (patientId, patientName, patientAge, patientGender, riskLevel, confidenceScore, eye, resultText, recommendation, reasons, summary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pid, patientName, patientAge, patientGender, 
        rightResult.riskLevel, rightResult.score, 'right', 
        rightResult.resultText, rightResult.recommendation, 
        JSON.stringify(rightResult.reasons), rightResult.summary
      ]
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
