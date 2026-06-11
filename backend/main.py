from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import os
import shutil
import time
import uuid
from agent import DataSmithAgent

app = FastAPI(title="DataSmith Wala API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

agent = DataSmithAgent()

@app.get("/")
async def root():
    return {"message": "Welcome to DataSmith Wala API"}

@app.post("/process")
async def process_query(
    query: Optional[str] = Form(None),
    files: Optional[List[UploadFile]] = File(None)
):
    saved_files = []
    try:
        # Use an empty string if query is not provided
        user_query = query if query else ""
        
        if files:
            for file in files:
                # Create a unique filename to avoid conflicts
                ext = os.path.splitext(file.filename)[1]
                unique_filename = f"{uuid.uuid4()}{ext}"
                file_path = os.path.join(UPLOAD_DIR, unique_filename)
                
                # Save the file
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                # Explicitly close the file
                file.file.close()
                
                saved_files.append(file_path)
        
        result = agent.run(user_query, saved_files)
        
        # Cleanup saved files after processing
        for path in saved_files:
            if os.path.exists(path):
                # Try multiple times to delete on Windows (file lock issues)
                for attempt in range(3):
                    try:
                        os.remove(path)
                        break
                    except OSError:
                        time.sleep(0.1)
                
        return result
    except Exception as e:
        # Cleanup even if there was an error
        for path in saved_files:
            if os.path.exists(path):
                for attempt in range(3):
                    try:
                        os.remove(path)
                        break
                    except OSError:
                        time.sleep(0.1)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
