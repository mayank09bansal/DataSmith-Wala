from tools.ocr_tool import perform_ocr
from tools.pdf_tool import extract_pdf_content
from tools.audio_tool import transcribe_audio
from tools.youtube_tool import get_youtube_transcript, extract_youtube_id
import re

class ToolRegistry:
    @staticmethod
    def process_file(file_path: str) -> dict:
        ext = file_path.split('.')[-1].lower()
        if ext in ['jpg', 'jpeg', 'png']:
            return {"type": "image", "data": perform_ocr(file_path)}
        elif ext == 'pdf':
            return {"type": "pdf", "data": extract_pdf_content(file_path)}
        elif ext in ['mp3', 'wav', 'm4a']:
            return {"type": "audio", "data": transcribe_audio(file_path)}
        else:
            return {"type": "unknown", "error": f"Unsupported file type: {ext}"}

    @staticmethod
    def find_youtube_urls(text: str) -> list:
        # Improved regex to handle watch?v=, youtu.be/, and shorts/
        youtube_regex = r'(https?://(?:www\.)?youtube\.com/watch\?v=[a-zA-Z0-9_-]{11}|https?://youtu\.be/[a-zA-Z0-9_-]{11}|https?://(?:www\.)?youtube\.com/shorts/[a-zA-Z0-9_-]{11})'
        return re.findall(youtube_regex, text)

    @staticmethod
    def fetch_youtube_content(url: str) -> dict:
        return get_youtube_transcript(url)
