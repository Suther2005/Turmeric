# 🌿 TurmeriCare — AI-Based Turmeric Crop Health Monitoring System

> An intelligent, full-stack agricultural platform for real-time turmeric crop disease detection, soil health analysis, and smart farming recommendations.

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Flask](https://img.shields.io/badge/Flask-2.3-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?logo=mysql&logoColor=white)](https://mysql.com)

---

## 📸 Features

| Feature | Description |
|---|---|
| 🦠 **Disease Detection** | YOLOv8 object detection + EfficientNet-B0 classification |
| 🔥 **Grad-CAM Heatmaps** | Explainable AI showing disease activation regions |
| 🎨 **Color Analysis** | OpenCV HSV analysis (green/yellow/brown percentages) |
| 🌱 **Soil Health** | Random Forest model predicting fertility and health |
| 📊 **Dashboard** | Chart.js charts, health gauges, recent predictions |
| 📄 **PDF Reports** | Auto-generated comprehensive crop health reports |
| 🛡️ **Admin Panel** | User management, system stats, CSV exports |

---

## 🗂️ Project Structure

```
TurmeriCare/
├── frontend/          # React.js + Vite + Tailwind CSS
│   └── src/
│       ├── pages/     # 12 application pages
│       ├── components/# Reusable UI components
│       ├── services/  # Axios API service layer
│       └── context/   # Auth & App state management
│
├── backend/           # Flask REST API
│   └── app/
│       ├── routes/    # 6 API blueprints
│       ├── models/    # SQLAlchemy ORM models
│       ├── ai/        # AI pipeline modules
│       └── utils/     # Auth, PDF, image helpers
│
└── database/
    └── schema.sql     # MySQL schema + seed data
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.10+
- **MySQL** 8.0+
- **pip**

---

### 1. Database Setup

```sql
mysql -u root -p < database/schema.sql
```

Or manually:
```sql
CREATE DATABASE turmericare;
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate     # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your MySQL credentials

# Run the server
python run.py
```

Backend runs on: **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies (already done if you ran setup)
npm install

# Run development server
npm run dev
```

Frontend runs on: **http://localhost:5173**

---

## ⚙️ Environment Configuration

Edit `backend/.env`:

```env
FLASK_ENV=development
SECRET_KEY=your-super-secret-key
JWT_SECRET_KEY=your-jwt-secret-key

DB_HOST=localhost
DB_PORT=3306
DB_NAME=turmericare
DB_USER=root
DB_PASSWORD=your_mysql_password

UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216

# Optional: Real AI model paths
YOLO_MODEL_PATH=app/ai/models/yolov8_turmeric.pt
EFFICIENTNET_MODEL_PATH=app/ai/models/efficientnet_turmeric.h5
```

---

## 🤖 AI Models

The system works in two modes:

### Mode 1: Mock Mode (Default)
Works out-of-the-box without real model files. Uses intelligent, deterministic mock outputs based on image analysis (file hash + pixel statistics) to generate realistic predictions.

### Mode 2: Real Model Mode
Drop your trained model files into:
- `backend/app/ai/models/yolov8_turmeric.pt` — YOLOv8 weights
- `backend/app/ai/models/efficientnet_turmeric.h5` — EfficientNet-B0 weights

The system automatically detects and loads them.

### Diseases Covered
| Disease | Type | Severity Range |
|---|---|---|
| Leaf Blotch | Fungal | Mild → Severe |
| Rhizome Rot | Bacterial | Moderate → Severe |
| Yellow Leaf Disease | Viral | Mild → Moderate |
| Fusarium Wilt | Fungal | Moderate → Severe |
| Soft Rot | Bacterial | Severe |
| Taro Leaf Blight | Oomycete | Mild → Severe |

---

## 📡 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login, get JWT tokens |
| `/api/auth/me` | GET | Get current user profile |
| `/api/dashboard/stats` | GET | Dashboard statistics |
| `/api/detection/upload` | POST | Upload image + run AI pipeline |
| `/api/detection/result/:id` | GET | Get prediction result |
| `/api/soil/analyze` | POST | Analyze soil parameters |
| `/api/reports/generate` | POST | Generate PDF report |
| `/api/reports/:id/download` | GET | Download PDF |
| `/api/admin/users` | GET | List all users (admin) |

---

## 🎨 UI Pages

| Page | URL | Auth |
|---|---|---|
| Landing | `/` | Public |
| About | `/about` | Public |
| Login | `/login` | Public |
| Register | `/register` | Public |
| Dashboard | `/dashboard` | ✅ Required |
| Upload | `/upload` | ✅ Required |
| Detection Result | `/result/:id` | ✅ Required |
| Soil Analysis | `/soil-analysis` | ✅ Required |
| Reports | `/reports` | ✅ Required |
| History | `/history` | ✅ Required |
| Profile | `/profile` | ✅ Required |
| Admin Panel | `/admin` | ✅ Admin only |

---

## 🧰 Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Chart.js, React Router, Axios, Framer Motion  
**Backend:** Python 3.10, Flask, SQLAlchemy, JWT, CORS  
**AI:** YOLOv8, EfficientNet-B0, OpenCV, Grad-CAM, Random Forest  
**Database:** MySQL 8  
**PDF:** ReportLab

---

## 🔐 Default Admin Credentials

```
Email:    admin@turmericare.com
Password: Admin@123
```

> ⚠️ Change immediately after first login in production!

---

## 📦 Building for Production

```bash
# Frontend build
cd frontend && npm run build

# Backend: set FLASK_ENV=production in .env
# Deploy with gunicorn:
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

---

## ☁️ Deploy (Render Blueprint)

This repo includes [render.yaml](render.yaml) so backend, frontend, and database can be provisioned together.

### 1) Push latest code

```bash
git push origin main
```

### 2) Create Render Blueprint

1. Open Render Dashboard → **New** → **Blueprint**
2. Connect this GitHub repo
3. Render auto-detects [render.yaml](render.yaml)
4. Click **Apply**

### 3) Set backend CORS origin

After first deploy, copy your frontend URL and set backend env var:

```text
CORS_ORIGINS=https://<your-frontend-domain>
```

You can also provide multiple origins as comma-separated values.

### 4) Verify

- Backend health: `https://<backend-domain>/api/health`
- Frontend app: `https://<frontend-domain>`

### Notes

- Backend runs with Gunicorn in production.
- Frontend is deployed as a static site.
- [backend/.env.example](backend/.env.example) and [frontend/.env.example](frontend/.env.example) include required variables.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <strong>Built with ❤️ for Indian Turmeric Farmers</strong><br>
  <em>Powered by AI • Designed for Rural Agriculture</em>
</div>
