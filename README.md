# GlacoVision - Early Glaucoma Detection System

This project is a complete, production-style web application for an AI-based glaucoma detection system, split into a modern Frontend and a robust Backend.

## 🚀 Project Structure

- **`/frontend`**: Built with Next.js 15, React, and Lucide React. Features a premium medical dashboard.
- **`/backend`**: Node.js Express server with SQLite3 for data persistence and simulated AI image analysis.

## 🛠️ How to Run

### 1. Start the Backend
Open a terminal in the `backend` folder:
```bash
cd backend
npm install
npm start
```
The server will run at `http://localhost:5000`.

### 2. Start the Frontend
Open a **new** terminal in the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:3000`.

## 🎯 Features
- **AI Screening**: Drag-and-drop Retina Fundus images for instant risk assessment.
- **Medical Reports**: Detailed analysis with risk levels (Low/Moderate/High) and confidence scores.
- **Dashboard**: History of all scans stored in a local SQLite database.
- **Responsive UI**: Fully optimized for Desktop and Mobile.

---
*Developed for demo/entrepreneurship presentations.*
