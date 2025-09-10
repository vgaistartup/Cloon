# 🚀 Expo Server Setup Guide - Virtual Try-On App

## Current Status
❌ **Node.js is required but not installed on this system**

## 📋 Prerequisites Setup

### Step 1: Install Node.js

**Option A: Official Installer (Recommended)**
1. Visit [nodejs.org](https://nodejs.org/)
2. Download **Node.js 18+ LTS** version
3. Run the installer and follow the setup wizard
4. Restart your terminal/command prompt

**Option B: Using Homebrew (macOS)**
```bash
# Install Homebrew first (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node
```

**Option C: Using Package Managers (Linux)**
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install nodejs npm

# CentOS/RHEL/Fedora
sudo dnf install nodejs npm

# Arch Linux
sudo pacman -S nodejs npm
```

### Step 2: Verify Installation
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
```

### Step 3: Install Expo CLI
```bash
npm install -g @expo/cli
```

## 🚀 Starting the Expo Server

Once Node.js is installed, you can start the Expo server using any of these methods:

### Method 1: Using the Setup Script
```bash
./start_expo.sh
```

### Method 2: Manual Steps
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start Expo development server
npx expo start
```

### Method 3: Using the Root Script
```bash
# From project root
npm run dev:frontend
```

## 📱 What Happens When Expo Starts

1. **Metro Bundler** starts on `http://localhost:8081`
2. **Expo DevTools** opens in your browser
3. **QR Code** appears for mobile device connection
4. **Local URLs** are provided for simulators

## 🔗 Connection Options

### Option A: Physical Device (Recommended)
1. Install **Expo Go** app from App Store/Google Play
2. Scan the QR code displayed in terminal
3. App will load on your device with hot reload

### Option B: iOS Simulator (macOS only)
1. Install Xcode from App Store
2. Press `i` in the Expo terminal
3. iOS Simulator will launch automatically

### Option C: Android Emulator
1. Install Android Studio
2. Set up an Android Virtual Device (AVD)
3. Press `a` in the Expo terminal
4. Android emulator will launch

### Option D: Web Browser (Limited functionality)
1. Press `w` in the Expo terminal
2. App opens in web browser
3. Note: Camera/native features won't work

## 🎯 Expected Output When Running

```
🚀 Virtual Try-On App - Expo Server Startup
============================================

📱 Starting Expo Development Server...

✓ All prerequisites ready!

🚀 Starting Expo Development Server...

› Metro waiting on exp://192.168.1.100:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator  
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
› Press d │ show developer menu
› Press ? │ show all commands

Logs for your project will appear below. Press Ctrl+C to exit.
```

## 🔧 Troubleshooting

### Common Issues:

**1. Port Already in Use**
```bash
# Kill process on port 8081
sudo lsof -ti:8081 | xargs kill -9

# Or start on different port
npx expo start --port 8082
```

**2. Network Issues**
```bash
# Clear Expo cache
npx expo start --clear

# Reset Metro cache
npx expo start --reset-cache
```

**3. Permission Errors**
```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
```

**4. Expo Go Not Connecting**
- Ensure devices are on the same WiFi network
- Check firewall settings
- Try using tunnel mode: `npx expo start --tunnel`

## 📋 Development Checklist

- [ ] Node.js 18+ installed
- [ ] Expo CLI installed globally
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Environment file created (`.env`)
- [ ] Expo Go app installed on mobile device
- [ ] Both devices on same WiFi network
- [ ] Backend server running (optional for full functionality)

## 🎯 Next Steps After Expo Starts

1. **Test the App Flow:**
   - Open app in Expo Go
   - Try the phone authentication (uses mock OTP)
   - Navigate to dashboard
   - Test photo upload functionality
   - Try avatar generation (stub endpoint)

2. **Start Backend (for full functionality):**
   ```bash
   # In new terminal
   cd backend
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Access Points:**
   - **Mobile App**: Expo Go with QR code
   - **Backend API**: `http://localhost:8000`
   - **API Docs**: `http://localhost:8000/docs`
   - **Health Check**: `http://localhost:8000/health`

## 🔄 Hot Reload Features

- **Automatic Refresh**: Code changes trigger instant app updates
- **Fast Refresh**: React components update without losing state
- **Error Overlay**: Development errors shown directly in app
- **Console Logging**: `console.log()` output appears in terminal

---

**Ready to revolutionize virtual try-on experiences! 🚀📱**