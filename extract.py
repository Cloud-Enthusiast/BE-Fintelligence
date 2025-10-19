from pypdf import PdfReader

def extract_text_from_pdf_pypdf(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

# Example usage:
pdf_file = "D:\Docs for job application\Resumes\Resume for Shekhar Iyer\ATS Friendly\Shekhar Iyer Resume.pdf"  # Replace with your PDF file path
extracted_text = extract_text_from_pdf_pypdf(pdf_file)
print(extracted_text)
