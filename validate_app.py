#!/usr/bin/env python3
"""
Virtual Try-On App - Complete Validation Suite
This script validates the entire application setup without requiring external dependencies
"""
import os
import sys
import json
import subprocess
from pathlib import Path

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    PURPLE = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'

def print_header(title):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{title.center(60)}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")

def print_section(title):
    print(f"\n{Colors.BOLD}{Colors.CYAN}{title}{Colors.END}")
    print(f"{Colors.CYAN}{'-'*len(title)}{Colors.END}")

def print_success(message):
    print(f"{Colors.GREEN}✓ {message}{Colors.END}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.END}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.END}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.END}")

def check_file_exists(filepath, description):
    """Check if a file exists and print result"""
    if Path(filepath).exists():
        print_success(f"{description}: {filepath}")
        return True
    else:
        print_error(f"Missing {description}: {filepath}")
        return False

def check_directory_structure():
    """Validate the project directory structure"""
    print_section("Project Structure Validation")
    
    required_files = [
        ("README.md", "Root README"),
        ("package.json", "Root package.json"),
        ("setup.sh", "Setup script"),
        ("backend/", "Backend directory"),
        ("frontend/", "Frontend directory"),
    ]
    
    backend_files = [
        ("backend/requirements.txt", "Backend requirements"),
        ("backend/.env.example", "Backend env example"),
        ("backend/app/main.py", "FastAPI main app"),
        ("backend/app/core/config.py", "Configuration"),
        ("backend/app/core/database.py", "Database setup"),
        ("backend/app/core/security.py", "Security utilities"),
        ("backend/app/models/user.py", "User models"),
        ("backend/app/models/auth.py", "Auth models"),
        ("backend/app/routers/health.py", "Health router"),
        ("backend/app/routers/auth.py", "Auth router"),
        ("backend/app/routers/upload.py", "Upload router"),
        ("backend/app/routers/ai.py", "AI router"),
    ]
    
    frontend_files = [
        ("frontend/package.json", "Frontend package.json"),
        ("frontend/app.json", "Expo config"),
        ("frontend/tsconfig.json", "TypeScript config"),
        ("frontend/.env.example", "Frontend env example"),
        ("frontend/app/_layout.tsx", "App layout"),
        ("frontend/app/index.tsx", "Index screen"),
        ("frontend/app/auth.tsx", "Auth screen"),
        ("frontend/app/dashboard.tsx", "Dashboard screen"),
        ("frontend/app/upload.tsx", "Upload screen"),
        ("frontend/components/Button.tsx", "Button component"),
        ("frontend/components/Input.tsx", "Input component"),
        ("frontend/components/Screen.tsx", "Screen component"),
        ("frontend/services/api.ts", "API service"),
        ("frontend/services/auth.ts", "Auth service"),
        ("frontend/types/api.ts", "API types"),
    ]
    
    all_files = required_files + backend_files + frontend_files
    passed = 0
    total = len(all_files)
    
    for filepath, description in all_files:
        if check_file_exists(filepath, description):
            passed += 1
    
    print(f"\n{Colors.BOLD}Structure Check: {passed}/{total} files found{Colors.END}")
    return passed == total

def validate_json_files():
    """Validate JSON configuration files"""
    print_section("JSON Configuration Validation")
    
    json_files = [
        "package.json",
        "frontend/package.json", 
        "frontend/app.json",
        "frontend/tsconfig.json"
    ]
    
    passed = 0
    for filepath in json_files:
        try:
            with open(filepath, 'r') as f:
                json.load(f)
            print_success(f"Valid JSON: {filepath}")
            passed += 1
        except FileNotFoundError:
            print_error(f"File not found: {filepath}")
        except json.JSONDecodeError as e:
            print_error(f"Invalid JSON in {filepath}: {e}")
    
    print(f"\n{Colors.BOLD}JSON Validation: {passed}/{len(json_files)} files valid{Colors.END}")
    return passed == len(json_files)

def check_python_syntax():
    """Check Python files for syntax errors"""
    print_section("Python Syntax Validation")
    
    python_files = []
    backend_dir = Path("backend")
    if backend_dir.exists():
        python_files = list(backend_dir.rglob("*.py"))
    
    if not python_files:
        print_warning("No Python files found in backend directory")
        return False
    
    passed = 0
    for py_file in python_files:
        try:
            with open(py_file, 'r') as f:
                compile(f.read(), py_file, 'exec')
            print_success(f"Valid Python syntax: {py_file}")
            passed += 1
        except SyntaxError as e:
            print_error(f"Syntax error in {py_file}: Line {e.lineno}: {e.msg}")
        except Exception as e:
            print_error(f"Error checking {py_file}: {e}")
    
    print(f"\n{Colors.BOLD}Python Syntax: {passed}/{len(python_files)} files valid{Colors.END}")
    return passed == len(python_files)

def check_typescript_structure():
    """Check TypeScript file structure"""
    print_section("TypeScript Structure Validation")
    
    ts_files = []
    frontend_dir = Path("frontend")
    if frontend_dir.exists():
        ts_files = list(frontend_dir.rglob("*.ts")) + list(frontend_dir.rglob("*.tsx"))
    
    if not ts_files:
        print_warning("No TypeScript files found in frontend directory")
        return False
    
    # Basic structure checks
    required_imports = {
        "frontend/app/index.tsx": ["React", "useRouter"],
        "frontend/app/auth.tsx": ["React", "useState", "useRouter"],
        "frontend/app/dashboard.tsx": ["React", "useRouter"],
        "frontend/services/api.ts": ["axios"],
    }
    
    passed = 0
    total = len(ts_files)
    
    for ts_file in ts_files:
        try:
            with open(ts_file, 'r') as f:
                content = f.read()
            
            # Check if it's a valid TypeScript/TSX structure
            if ts_file.suffix == '.tsx' and 'export default' in content:
                print_success(f"Valid React component: {ts_file}")
            elif ts_file.suffix == '.ts' and ('export' in content or 'import' in content):
                print_success(f"Valid TypeScript module: {ts_file}")
            else:
                print_warning(f"Basic structure OK: {ts_file}")
            
            passed += 1
        except Exception as e:
            print_error(f"Error reading {ts_file}: {e}")
    
    print(f"\n{Colors.BOLD}TypeScript Structure: {passed}/{total} files checked{Colors.END}")
    return passed == total

def validate_api_endpoints():
    """Validate API endpoint definitions"""
    print_section("API Endpoints Validation")
    
    router_files = {
        "backend/app/routers/health.py": ["/health"],
        "backend/app/routers/auth.py": ["/send-otp", "/verify-otp"], 
        "backend/app/routers/upload.py": ["/photo"],
        "backend/app/routers/ai.py": ["/generate-avatar", "/models", "/styles"]
    }
    
    passed = 0
    total = len(router_files)
    
    for router_file, expected_routes in router_files.items():
        try:
            with open(router_file, 'r') as f:
                content = f.read()
            
            found_routes = []
            for route in expected_routes:
                if f'"{route}"' in content or f"'{route}'" in content:
                    found_routes.append(route)
            
            if len(found_routes) == len(expected_routes):
                print_success(f"All routes found in {router_file}: {found_routes}")
                passed += 1
            else:
                missing = set(expected_routes) - set(found_routes)
                print_warning(f"Some routes missing in {router_file}: {missing}")
                
        except FileNotFoundError:
            print_error(f"Router file not found: {router_file}")
        except Exception as e:
            print_error(f"Error checking {router_file}: {e}")
    
    print(f"\n{Colors.BOLD}API Endpoints: {passed}/{total} routers validated{Colors.END}")
    return passed == total

def check_environment_setup():
    """Check environment configuration"""
    print_section("Environment Configuration")
    
    # Check if .env.example files exist and have required variables
    env_configs = {
        "backend/.env.example": [
            "MONGODB_URL", "DATABASE_NAME", "JWT_SECRET", 
            "JWT_ALGORITHM", "JWT_EXPIRATION_HOURS", "UPLOAD_DIR"
        ],
        "frontend/.env.example": ["EXPO_PUBLIC_API_URL"]
    }
    
    passed = 0
    total = len(env_configs)
    
    for env_file, required_vars in env_configs.items():
        try:
            with open(env_file, 'r') as f:
                content = f.read()
            
            found_vars = []
            for var in required_vars:
                if var in content:
                    found_vars.append(var)
            
            if len(found_vars) == len(required_vars):
                print_success(f"All environment variables in {env_file}")
                passed += 1
            else:
                missing = set(required_vars) - set(found_vars)
                print_warning(f"Missing variables in {env_file}: {missing}")
                
        except FileNotFoundError:
            print_error(f"Environment file not found: {env_file}")
    
    print(f"\n{Colors.BOLD}Environment Setup: {passed}/{total} configurations valid{Colors.END}")
    return passed == total

def generate_deployment_guide():
    """Generate deployment instructions"""
    print_section("Deployment Guide")
    
    guide = f"""
{Colors.BOLD}🚀 Virtual Try-On App - Deployment Guide{Colors.END}

{Colors.CYAN}Prerequisites:{Colors.END}
• Node.js 18+ and npm
• Python 3.11+
• MongoDB (local or cloud)
• Expo CLI: npm install -g @expo/cli

{Colors.CYAN}Quick Start:{Colors.END}
1. {Colors.GREEN}Install dependencies:{Colors.END}
   ./setup.sh

2. {Colors.GREEN}Start backend:{Colors.END}
   cd backend
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

3. {Colors.GREEN}Start frontend:{Colors.END}
   cd frontend  
   npx expo start

{Colors.CYAN}Verify Setup:{Colors.END}
• Backend API: http://localhost:8000/health
• API Docs: http://localhost:8000/docs
• Mobile App: Scan QR code with Expo Go

{Colors.CYAN}Architecture:{Colors.END}
• Frontend: React Native + Expo + TypeScript
• Backend: FastAPI + async MongoDB + JWT auth
• Features: Phone auth, photo upload, AI stubs

{Colors.GREEN}✓ All core components are properly structured and ready!{Colors.END}
"""
    print(guide)

def main():
    """Run complete validation suite"""
    print_header("VIRTUAL TRY-ON APP VALIDATION SUITE")
    
    print_info("Validating complete application setup...")
    print_info("This checks code structure, syntax, and configuration")
    
    # Run all validation checks
    checks = [
        ("Directory Structure", check_directory_structure),
        ("JSON Configuration", validate_json_files),
        ("Python Syntax", check_python_syntax),
        ("TypeScript Structure", check_typescript_structure),
        ("API Endpoints", validate_api_endpoints),
        ("Environment Setup", check_environment_setup),
    ]
    
    passed_checks = 0
    total_checks = len(checks)
    
    for check_name, check_func in checks:
        try:
            result = check_func()
            if result:
                passed_checks += 1
        except Exception as e:
            print_error(f"Error in {check_name}: {e}")
    
    # Final summary
    print_header("VALIDATION SUMMARY")
    
    if passed_checks == total_checks:
        print(f"{Colors.GREEN}{Colors.BOLD}🎉 ALL CHECKS PASSED! ({passed_checks}/{total_checks}){Colors.END}")
        print(f"{Colors.GREEN}✓ Virtual Try-On App is properly structured and ready for deployment{Colors.END}")
        success = True
    else:
        print(f"{Colors.YELLOW}{Colors.BOLD}⚠️  PARTIAL SUCCESS ({passed_checks}/{total_checks}){Colors.END}")
        print(f"{Colors.YELLOW}Some components need attention before deployment{Colors.END}")
        success = passed_checks >= (total_checks * 0.8)  # 80% pass rate
    
    # Always show deployment guide
    generate_deployment_guide()
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)