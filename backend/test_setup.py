#!/usr/bin/env python3
"""
Simple test script to verify the Virtual Try-On backend setup
"""
import sys
import os

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_imports():
    """Test that all modules can be imported"""
    try:
        print("Testing imports...")
        
        # Test core modules
        from app.core import config, database, security
        print("✓ Core modules imported successfully")
        
        # Test models
        from app.models import user, auth, api
        print("✓ Model modules imported successfully")
        
        # Test routers
        from app.routers import health, auth, upload, ai
        print("✓ Router modules imported successfully")
        
        # Test main app
        from app.main import create_app
        print("✓ Main app module imported successfully")
        
        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_app_creation():
    """Test FastAPI app creation"""
    try:
        from app.main import create_app
        app = create_app()
        print("✓ FastAPI app created successfully")
        print(f"  App title: {app.title}")
        print(f"  App version: {app.version}")
        return True
    except Exception as e:
        print(f"❌ App creation failed: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 50)
    print("Virtual Try-On Backend Test Suite")
    print("=" * 50)
    
    tests = [
        ("Import Test", test_imports),
        ("App Creation Test", test_app_creation),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        print("-" * 20)
        if test_func():
            passed += 1
        else:
            print(f"❌ {test_name} failed")
    
    print("\n" + "=" * 50)
    print(f"Test Results: {passed}/{total} passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend setup is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the errors above.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)