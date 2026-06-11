import os
from dotenv import load_dotenv

load_dotenv()

def perform_ocr(image_path: str) -> dict:
    try:
        import pytesseract
        from PIL import Image
        
        # Get tesseract path from env
        tesseract_path = os.getenv("TESSERACT_PATH")
        if tesseract_path:
            pytesseract.pytesseract.tesseract_cmd = tesseract_path
        
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img)
        
        if not text.strip():
            return {
                "text": "The image appears to contain no readable text.",
                "success": False,
                "error": "No text extracted"
            }
            
        return {
            "text": text,
            "success": True,
            "method": "pytesseract"
        }
    except Exception as e:
        return {
            "text": f"[Image: {os.path.basename(image_path)} - Text extraction unavailable. Please ask questions about the visual content.]",
            "success": True,
            "method": "fallback"
        }
