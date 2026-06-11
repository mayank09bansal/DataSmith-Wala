import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

def transcribe_audio(audio_path: str) -> dict:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return {
            "text": "[MOCK] Audio transcription failed: No API key provided.",
            "success": False,
            "error": "No GROQ_API_KEY found"
        }
    
    try:
        client = OpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1"
        )
        
        with open(audio_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                file=(os.path.basename(audio_path), audio_file.read()),
                model="whisper-large-v3",
                response_format="verbose_json",
            )
            
        return {
            "text": transcription.text,
            "duration": transcription.duration,
            "success": True
        }
    except Exception as e:
        return {
            "text": "",
            "success": False,
            "error": str(e)
        }
