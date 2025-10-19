#!/usr/bin/env python3
"""
Test script for the PyPDF extraction service
"""
import requests
import sys
import os

def test_health_check():
    """Test if the service is running"""
    try:
        response = requests.get('http://localhost:8001/health')
        if response.status_code == 200:
            print("✅ Service is running and healthy")
            return True
        else:
            print(f"❌ Service health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to service. Is it running on port 8001?")
        return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_pdf_extraction(pdf_path):
    """Test PDF extraction with a sample file"""
    if not os.path.exists(pdf_path):
        print(f"❌ PDF file not found: {pdf_path}")
        return False
    
    try:
        with open(pdf_path, 'rb') as f:
            files = {'file': f}
            response = requests.post('http://localhost:8001/extract-pdf', files=files)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ PDF extraction successful!")
                print(f"   📄 Pages: {result.get('page_count', 0)}")
                print(f"   📝 Text length: {len(result.get('extracted_text', ''))}")
                print(f"   📊 Word count: {result.get('statistics', {}).get('word_count', 0)}")
                
                # Show extracted info summary
                info = result.get('extracted_info', {})
                if info.get('emails'):
                    print(f"   📧 Emails found: {len(info['emails'])}")
                if info.get('phones'):
                    print(f"   📞 Phones found: {len(info['phones'])}")
                if info.get('skills'):
                    print(f"   💼 Skills found: {len(info['skills'])}")
                
                return True
            else:
                print(f"❌ PDF extraction failed: {result.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ HTTP error: {response.status_code}")
            try:
                error_detail = response.json().get('detail', 'Unknown error')
                print(f"   Error: {error_detail}")
            except:
                print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ PDF extraction test error: {e}")
        return False

def main():
    print("🧪 Testing PyPDF Extraction Service")
    print("=" * 40)
    
    # Test 1: Health check
    print("\n1. Testing service health...")
    if not test_health_check():
        print("\n💡 To start the service, run:")
        print("   python start_service.py")
        sys.exit(1)
    
    # Test 2: PDF extraction
    print("\n2. Testing PDF extraction...")
    
    # Look for a test PDF file
    test_files = [
        "test.pdf",
        "../test.pdf",
        "sample.pdf",
        "../sample.pdf"
    ]
    
    pdf_found = False
    for pdf_file in test_files:
        if os.path.exists(pdf_file):
            print(f"   Using test file: {pdf_file}")
            if test_pdf_extraction(pdf_file):
                pdf_found = True
                break
    
    if not pdf_found:
        print("⚠️  No test PDF file found. To test extraction:")
        print("   1. Place a PDF file named 'test.pdf' in this directory")
        print("   2. Run this script again")
        print("\n   Or test manually:")
        print("   curl -X POST -F 'file=@your_file.pdf' http://localhost:8001/extract-pdf")
    
    print("\n" + "=" * 40)
    print("🎉 Service testing complete!")
    
    if pdf_found:
        print("\n✅ All tests passed! The service is ready to use.")
        print("\n🔗 Integration URLs:")
        print("   Service: http://localhost:8001")
        print("   API Docs: http://localhost:8001/docs")
        print("   Health: http://localhost:8001/health")
    else:
        print("\n⚠️  Service is running but PDF extraction not tested.")

if __name__ == "__main__":
    main()