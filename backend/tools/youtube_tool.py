import re
from youtube_transcript_api import YouTubeTranscriptApi

def extract_youtube_id(url: str) -> str:
    patterns = [
        r'(?:v=|\/)([0-9A-Za-z_-]{11}).*',
        r'shorts\/([0-9A-Za-z_-]{11})',
        r'youtu\.be\/([0-9A-Za-z_-]{11})'
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def get_youtube_transcript(url: str) -> dict:
    video_id = extract_youtube_id(url)
    if not video_id:
        return {
            "text": "",
            "success": False,
            "error": "Could not extract video ID from URL"
        }
    
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        transcript_text = " ".join([item['text'] for item in transcript_list])
        return {
            "text": transcript_text,
            "video_id": video_id,
            "success": True
        }
    except Exception as e:
        return {
            "text": "",
            "video_id": video_id,
            "success": False,
            "error": str(e)
        }
