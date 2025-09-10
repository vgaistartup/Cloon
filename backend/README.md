# Virtual Try-On App - Backend API

A FastAPI backend service for the Virtual Try-On mobile application, featuring async MongoDB, authentication, file uploads, and AI integration stubs.

## 🚀 Features

- 🔐 **Phone Authentication**: OTP-based login system
- 📁 **File Management**: Image upload and storage
- 🤖 **AI-Ready**: Stub endpoints for AI model integration
- 📊 **Async Database**: MongoDB with Motor for async operations
- 🔒 **JWT Security**: Token-based authentication
- 📖 **Auto-Documentation**: Swagger/OpenAPI docs
- 🚀 **Fast Performance**: Async/await throughout

## 🛠️ Tech Stack

- **Framework**: FastAPI
- **Language**: Python 3.11+
- **Database**: MongoDB with Motor (async)
- **Authentication**: JWT with python-jose
- **File Handling**: aiofiles for async file operations
- **Validation**: Pydantic models

## 📋 Prerequisites

- Python 3.11+
- MongoDB (local or cloud instance)
- pip (Python package installer)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Environment Setup

Copy the example environment file:
```bash
cp .env.example .env
```

Update the `.env` file with your configuration:
```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=virtual_try_on
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=10485760
```

### 3. Start MongoDB

Make sure MongoDB is running:
```bash
# If using local MongoDB
mongod

# If using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Start the Server

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using the shortcut
python -m uvicorn app.main:app --reload
```

The API will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **Redoc**: http://localhost:8000/redoc

## 📁 Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application setup
│   ├── core/                # Core configuration
│   │   ├── config.py        # Settings and configuration
│   │   ├── database.py      # MongoDB connection
│   │   └── security.py      # JWT and security utilities
│   ├── models/              # Pydantic models
│   │   ├── user.py          # User data models
│   │   ├── auth.py          # Authentication models
│   │   └── api.py           # API response models
│   └── routers/             # API route handlers
│       ├── health.py        # Health check endpoint
│       ├── auth.py          # Authentication routes
│       ├── upload.py        # File upload routes
│       └── ai.py            # AI processing routes
├── uploads/                 # File upload directory
├── requirements.txt         # Python dependencies
├── .env.example            # Environment variables template
└── README.md               # This file
```

## 🔗 API Endpoints

### Health Check
- `GET /health` - Service health status

### Authentication
- `POST /auth/send-otp` - Send OTP to phone number
- `POST /auth/verify-otp` - Verify OTP and login

### File Upload
- `POST /upload/photo` - Upload user photo (requires auth)

### AI Processing
- `POST /ai/generate-avatar` - Generate avatar (stub)
- `GET /ai/models` - Available AI models
- `GET /ai/styles` - Available avatar styles

## 📊 Database Schema

### Users Collection
```javascript
{
  "_id": ObjectId,
  "user_id": "string",          // Unique user identifier
  "phone_number": "string",     // User's phone number
  "created_at": DateTime,       // Account creation time
  "updated_at": DateTime,       // Last update time
  "is_active": Boolean,         // Account status
  "profile_photos": ["string"]  // Array of photo URLs
}
```

### OTPs Collection (TTL)
```javascript
{
  "_id": ObjectId,
  "phone_number": "string",     // Phone number
  "otp_code": "string",         // Generated OTP
  "created_at": DateTime,       // Creation time
  "expires_at": DateTime,       // Expiration time (TTL index)
  "verified": Boolean           // Verification status
}
```

## 🔧 Development

### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

### Code Quality
```bash
# Install linting tools
pip install black flake8 mypy

# Format code
black app/

# Lint code
flake8 app/

# Type checking
mypy app/
```

### Database Management
```bash
# MongoDB shell
mongo

# List databases
show dbs

# Use virtual_try_on database
use virtual_try_on

# List collections
show collections

# Query users
db.users.find().pretty()
```

## 🤖 AI Integration

The API provides stub endpoints ready for AI model integration:

### Supported Models (Planned)
- **Google Gemini Pro Vision**: Multimodal AI for image understanding
- **OpenAI DALL-E 3**: Advanced image generation
- **Custom Models**: Specialized virtual try-on models

### Integration Points
1. **Image Processing**: `POST /ai/generate-avatar`
2. **Model Selection**: `GET /ai/models`
3. **Style Options**: `GET /ai/styles`

To integrate real AI models:
1. Install model-specific SDKs
2. Update `app/routers/ai.py`
3. Add model configuration to settings
4. Implement async processing with queues

## 🔒 Security

- **JWT Tokens**: Secure user authentication
- **File Validation**: Type and size checks
- **Input Sanitization**: Pydantic validation
- **CORS**: Configurable cross-origin requests
- **Rate Limiting**: Ready for implementation

## 📦 Deployment

### Docker
```bash
# Build image
docker build -t virtual-try-on-api .

# Run container
docker run -d -p 8000:8000 --env-file .env virtual-try-on-api
```

### Production Considerations
- Use production MongoDB cluster
- Set secure JWT secrets
- Configure file storage (AWS S3, etc.)
- Add rate limiting and monitoring
- Set up SSL/HTTPS
- Use environment-specific configs

## 🚧 TODOs

- [ ] Real OTP integration (Twilio, AWS SNS)
- [ ] Cloud file storage (AWS S3, Google Cloud Storage)
- [ ] AI model integration (OpenAI, Google, Custom)
- [ ] Rate limiting and security headers
- [ ] Comprehensive logging and monitoring
- [ ] Unit and integration tests
- [ ] Docker containerization
- [ ] CI/CD pipeline

---

For frontend setup, see `../frontend/README.md`