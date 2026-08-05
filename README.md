# ISTE Student's Chapter MITS-DU Website

A high-performance, responsive web platform for the **Indian Society for Technical Education (ISTE) Student's Chapter, MITS-DU Gwalior**. Built with modern 3D WebGL graphics, dynamic Content Management System (CMS), and scalable cloud architecture.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), TypeScript, TailwindCSS, Framer Motion, Three.js, OGL WebGL, Zustand, Lucide Icons
- **Backend**: FastAPI (Python), Uvicorn
- **Database**: MongoDB Atlas (NoSQL)
- **Asset CDN**: Cloudinary Media Management
- **Authentication**: JWT & Google OAuth 2.0

---

## 📁 Project Structure

```
ISTE/
├── frontend/             # React + Vite TypeScript App
│   ├── src/
│   │   ├── assets/       # Static media & icons
│   │   ├── components/   # UI & WebGL animation components
│   │   ├── pages/        # Application pages & Admin CMS
│   │   ├── store/        # Zustand state management
│   │   └── utils/        # Helpers & sorters
│   └── package.json
│
├── backend/              # FastAPI Python App
│   ├── app/
│   │   ├── routes/       # REST API Endpoints
│   │   ├── schemas/      # Pydantic validation schemas
│   │   ├── config.py     # Environment configuration
│   │   ├── database.py   # MongoDB Atlas connection
│   │   └── main.py       # FastAPI application entry
│   └── requirements.txt
│
├── api/                  # Vercel serverless entry point
├── vercel.json           # Vercel deployment routing
└── README.md
```

---

## ⚙️ Build & Run Commands

### **Frontend**
```bash
cd frontend

# Install dependencies
npm install

# Run local development server
npm run dev

# Build for production
npm run build
```

### **Backend**
```bash
cd backend

# Setup virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
uvicorn app.main:app --reload --port 8000
```

---

## 👨‍💻 Author

**Shivam Patidar**  
*Lead Developer & Architect — ISTE Student's Chapter MITS-DU*
