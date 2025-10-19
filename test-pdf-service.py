#!/usr/bin/env python3
"""
Quick test script to verify the PDF service is working
"""
import requests
import sys


def test_pdf_service():
    base_url = "http://localhost:8001"

    print("🧪 Testing PDF Extraction Service...")
    print(f"📍 Service URL: {base_url}")
    print()

    # Test 1: Health check
    print("1️⃣ Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to service: {e}")
        print("💡 Make sure to start the service first:")
        print("   cd backend && python -m uvicorn pdf_service:app --port 8001")
        return False

    print()

    # Test 2: Root endpoint
    print("2️⃣ Testing root endpoint...")
    try:
        response = requests.get(f"{base_url}/", timeout=5)
        if response.status_code == 200:
            print("✅ Root endpoint working")
            data = response.json()
            print(f"   Service: {data.get('service')}")
            print(f"   Version: {data.get('version')}")
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Root endpoint error: {e}")

    print()
    print("🎉 PDF service is ready!")
    print("📝 You can now:")
    print("   • Start your React app: npm run dev")
    print("   • Upload PDF files for processing")
    print("   • View API docs: http://localhost:8001/docs")

    return True


if __name__ == "__main__":
    success = test_pdf_service()
    sys.exit(0 if success else 1)
