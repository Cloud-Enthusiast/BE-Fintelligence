# PDF Extraction Service Setup

## Quick Start

### 1. Start the PDF Service
```bash
# Windows
start-pdf-service.bat

# Or manually
cd backend
pip install -r requirements.txt
python -m uvicorn pdf_service:app --host 0.0.0.0 --port 8001 --reload
```

### 2. Start the React App
```bash
npm run dev
```

### 3. Upload PDFs
- The React app will automatically use the Python service for PDF processing
- If the service is unavailable, you'll see a clear error message

## Architecture

### Before (Complex)
```
PDF Upload → Multiple extraction methods → Conflicts → Inconsistent results
├── Client-side OCR (Tesseract.js)
├── Client-side PDF.js
├── Enhanced PDF extraction
└── PyPDF server (when available)
```

### After (Simple)
```
PDF Upload → Python PyPDF Service → Consistent high-accuracy results
```

## Benefits

✅ **Single source of truth** - All PDF processing through Python
✅ **95-99% accuracy** - Your proven PyPDF implementation
✅ **Rich data extraction** - Emails, skills, companies, etc.
✅ **Detailed analytics** - Word count, reading time, confidence scores
✅ **Clean codebase** - Removed 3 complex PDF extraction hooks
✅ **Smaller bundle** - Removed client-side PDF dependencies

## API Endpoints

- **Health Check**: `GET http://localhost:8001/health`
- **Extract PDF**: `POST http://localhost:8001/extract-pdf`
- **API Docs**: `http://localhost:8001/docs`

## Error Handling

If the Python service is not running, users will see:
> "PDF extraction service is not available. Please ensure the Python backend is running on port 8001."

## Files Changed

### Added
- `src/hooks/usePdfExtraction.ts` - Clean PDF extraction hook
- `start-pdf-service.bat` - Easy service startup

### Removed
- `src/hooks/useFallbackPdfExtraction.ts`
- `src/hooks/useEnhancedPdfExtraction.ts` 
- `src/hooks/usePyPdfExtraction.ts`
- Client-side PDF dependencies (pdfjs-dist, tesseract.js, etc.)

### Modified
- `src/hooks/useFileExtraction.ts` - Simplified to use only Python service
- `package.json` - Removed unnecessary dependencies

## Troubleshooting

### Service Won't Start
```bash
# Check Python version
python --version  # Should be 3.7+

# Install dependencies
cd backend
pip install -r requirements.txt
```

### React App Can't Connect
- Ensure service is running: `curl http://localhost:8001/health`
- Check CORS settings in `backend/pdf_service.py`

### PDF Processing Fails
- Check file size (max 50MB)
- Verify PDF is not password protected
- Check service logs for errors