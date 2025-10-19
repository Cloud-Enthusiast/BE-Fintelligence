#!/usr/bin/env python3
"""
Quick start script for the PDF extraction service
"""
import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    print("Installing requirements...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

def start_service():
    """Start the FastAPI service"""
    print("Starting PDF extraction service...")
    print("Service will be available at: http://localhost:8001")
    print("API documentation at: http://localhost:8001/docs")
    print("\nPress Ctrl+C to stop the service")
    
    subprocess.run([
        sys.executable, "-m", "uvicorn", 
        "pdf_service:app", 
        "--host", "0.0.0.0", 
        "--port", "8001", 
        "--reload"
    ])

if __name__ == "__main__":
    try:
        # Check if we're in the right directory
        if not os.path.exists("pdf_service.py"):
            print("Error: pdf_service.py not found. Make sure you're in the backend directory.")
            sys.exit(1)
        
        # Install requirements if needed
        try:
            import fastapi
            import pypdf
        except ImportError:
            install_requirements()
        
        # Start the service
        start_service()
        
    except KeyboardInterrupt:
        print("\nService stopped.")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)