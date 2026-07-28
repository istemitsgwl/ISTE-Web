# Official Website of ISTE Student's Chapter MITS-DU

A state-of-the-art, high-performance, dynamic web platform for the **Indian Society for Technical Education (ISTE) Student's Chapter, MITS-DU (Madhav Institute of Technology & Science, Deemed University, Gwalior)**.

---

## 🚀 Project Overview

The **ISTE MITS Website** provides a seamless digital experience for students, faculty, and administrators. It features interactive 3D WebGL visuals, real-time dynamic Cloud Firestore integration, user authentication, event registration, pass QR code generation, and a complete Content Management System (CMS) for chapter administrators.

---

## 🛠️ Technology Stack

### **Frontend**
- **Core Framework**: React 18 (Vite) + TypeScript
- **Styling**: TailwindCSS + Custom CSS tokens
- **Animations & WebGL**: Framer Motion, OGL WebGL Canvas (3D Circular Gallery), Three.js
- **State Management**: Zustand (`authStore.ts`)
- **Routing**: React Router v6
- **Icons**: Lucide React

### **Backend & Database**
- **Backend API**: FastAPI (Python 3.10+), Uvicorn ASGI
- **Authentication**: Firebase Authentication (Email/Password & Google OAuth)
- **Database**: Cloud Firestore (NoSQL)
- **File Storage**: Firebase Storage Bucket
- **Payments & Webhooks**: Razorpay Payment Gateway Integration
- **PDF Generation**: ReportLab (Digital Certificates & Invoices)

---

## ✨ Key Features

- **Dynamic Team Management**: Firestore-backed steering committee showcase with 8 standardized committee categories.
- **Dynamic Photo Gallery**: Interactive gallery with category filtering, full-screen lightbox viewer, and 3D WebGL Circular Gallery showcase on the Home page.
- **Event Registrations & Pass Generation**: Interactive event listings with custom field schemas, paid/free registration flows, and downloadable QR code passes.
- **Student Dashboard**: Personalized workspace displaying user registrations, event passes, digital certificates, and profile customization.
- **Admin CMS Panel**: Role-protected dashboard for full CRUD management over Events, Gallery, Team Members, FAQs, and Registrations export.
- **Faculty Mentors Showcase**: Guidance & leadership section with official designations.

---

## 📁 Project Folder Structure

```
ISTE/
├── frontend/                     # React + Vite TypeScript Frontend
│   ├── src/
│   │   ├── assets/              # Media assets and logos
│   │   ├── components/          # Reusable UI & WebGL animation components
│   │   ├── context/             # ThemeContext (Dark/Light mode)
│   │   ├── data/                # Client backup datasets
│   │   ├── lib/                 # Firebase Client SDK initialization
│   │   ├── pages/               # Application pages (Home, Team, Events, Admin, etc.)
│   │   ├── store/               # Zustand state stores
│   │   └── utils/               # Event sorters and helper functions
│   ├── .env.example             # Frontend environment template
│   ├── package.json             # Frontend npm dependencies
│   ├── tsconfig.json            # TypeScript configuration
│   └── vite.config.ts           # Vite build configuration
│
├── backend/                      # FastAPI Python Backend
│   ├── app/
│   │   ├── config.py            # App configuration settings & CORS setup
│   │   ├── firebase.py          # Firebase Admin SDK singleton client
│   │   ├── main.py              # FastAPI app initialization & CORS middleware
│   │   ├── providers/           # Razorpay payment provider
│   │   ├── routes/              # API router endpoints (Auth, Events, Content, Health)
│   │   └── utils/               # PDF generation utilities
│   ├── .env.example             # Backend environment template
│   ├── requirements.txt         # Python package dependencies
│   └── seed.py                  # Database seeding utility script
│
├── firestore.rules               # Cloud Firestore security rules
├── storage.rules                 # Firebase Storage security rules
├── firebase.json                 # Firebase deployment configuration
├── .gitignore                    # Root Git ignore rules
└── README.md                     # Project documentation
```

---

## ⚙️ Local Development Setup

### **Prerequisites**
- **Node.js**: v18.x or higher
- **Python**: v3.10 or higher
- **npm**: v9.x or higher

### **1. Frontend Setup**
```bash
cd frontend

# Install dependencies
npm install

# Create local environment file from template
cp .env.example .env

# Start local Vite development server
npm run dev
```
*Frontend app runs at: `http://localhost:5173`*

### **2. Backend Setup**
```bash
cd backend

# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/venv/activate  # On macOS/Linux
# venv\Scripts\activate      # On Windows

# Install Python dependencies
pip install -r requirements.txt

# Create local environment file from template
cp .env.example .env

# Start Uvicorn development server
uvicorn app.main:app --reload --port 8000
```
*Backend API runs at: `http://localhost:8000/api`*

---

## 🔧 Environment Variables

### **Frontend Environment Variables (`frontend/.env`)**
```env
VITE_API_URL=http://localhost:8000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_USE_EMULATOR=false
```

### **Backend Environment Variables (`backend/.env`)**
```env
FIREBASE_PROJECT_ID=iste-mits-2026
RAZORPAY_KEY_ID=rzp_test_key_here
RAZORPAY_KEY_SECRET=rzp_secret_here
RAZORPAY_WEBHOOK_SECRET=rzp_webhook_secret_here
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,https://iste-mits.vercel.app
```

---

## 🔒 Security & Secret Protection Note

> [!IMPORTANT]
> **Never commit real secrets or private credentials to Git repositories.**
> - Local `.env` files and `serviceAccountKey.json` are strictly ignored by root, frontend, and backend `.gitignore` rules.
> - Always use environment variable settings in **Vercel Dashboard** and **Render Dashboard** for production credentials.

---

## 🏗️ Production Build & Deployment

### **Frontend (Vercel)**
```bash
cd frontend
npm run build
```
- **Build Output**: `frontend/dist`
- **Deployment Platform**: Vercel (Root Directory: `frontend`, Build Command: `npm run build`, Output Directory: `dist`)

### **Backend (Render)**
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Deployment Platform**: Render Web Service

### **Firebase Rules Deployment**
```bash
npx -y firebase-tools deploy --only firestore:rules,storage:rules
```

---

## 👨‍💻 Developer & Leadership

Developed & Designed for **ISTE Student's Chapter MITS-DU**.  
**Lead Developer**: Shivam Patidar (CSD)
