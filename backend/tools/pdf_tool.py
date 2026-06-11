import os
import pdfplumber

def extract_pdf_content(pdf_path: str) -> dict:
    try:
        text_content = []
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    text_content.append(text)
        
        full_text = "\n".join(text_content)
        
        if not full_text.strip():
            return {
                "text": "The PDF document appears to be empty or contains only images.",
                "success": False,
                "error": "No text extracted"
            }
            
        return {
            "text": full_text,
            "success": True,
            "method": "pdfplumber"
        }
    except Exception as e:
        return {
            "text": "",
            "success": False,
            "error": str(e)
        }
