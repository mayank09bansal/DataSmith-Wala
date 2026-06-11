import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from tools.ocr_tool import perform_ocr

# Find any image file in uploads
uploads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
image_files = [f for f in os.listdir(uploads_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]

if image_files:
    test_image = os.path.join(uploads_dir, image_files[0])
    print(f"Testing OCR on: {test_image}")
    result = perform_ocr(test_image)
    print("\nOCR Result:")
    print(result)
else:
    print("No image files found in uploads directory")
