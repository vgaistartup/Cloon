# Virtual Try-On App 🚀

A modern Virtual Try-On application built with React Native (Expo) and FastAPI.

## 🏗️ Architecture

- **Frontend**: React Native with Expo, TypeScript, Expo Router
- **Backend**: FastAPI with Python 3.11, async MongoDB
- **AI Layer**: Stub endpoints ready for AI model integration

## 📁 Project Structure

```
virtual-try-on-app/
├── frontend/          # React Native Expo app
├── backend/           # FastAPI Python backend
├── package.json       # Root package.json for workspace
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Expo CLI (`npm install -g @expo/cli`)
- MongoDB (local or cloud instance)

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Environment Setup

Create environment files:

**Backend** (`backend/.env`):
```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=virtual_try_on
JWT_SECRET=your-jwt-secret-here
```

**Frontend** (`frontend/.env`):
```
EXPO_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run the Application

**Option A: Run both frontend and backend together**
```bash
npm run dev
```

**Option B: Run separately**

Backend:
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:
```bash
cd frontend
npx expo start
```

## 📱 Features

- 📞 Phone number authentication with OTP (mocked)
- 📸 Photo upload functionality (dummy storage)
- 🤖 AI avatar generation (stub endpoints)
- 🎨 Minimal Apple-inspired design
- 📱 Mobile-first responsive design

## 🔗 API Endpoints

- `GET /health` - Health check
- `POST /auth/send-otp` - Send OTP to phone number
- `POST /auth/verify-otp` - Verify OTP and login
- `POST /upload/photo` - Upload user photo
- `POST /ai/generate-avatar` - Generate avatar (stub)

## 🛠️ Development

### Backend Development
- FastAPI auto-documentation: http://localhost:8000/docs
- MongoDB connection with async Motor
- Structured logging and error handling

### Frontend Development
- Expo Router for navigation
- TypeScript for type safety
- Apple-inspired minimal UI components
- Image picker and camera integration

## 🚧 Roadmap

- [ ] Real OTP integration (Twilio/Firebase)
- [ ] AI model integration (Google Gemini, OpenAI)
- [ ] Real image storage (AWS S3, Cloudinary)
- [ ] User profile management
- [ ] Try-on history and favorites

---

Built with ❤️ for modern mobile experiences