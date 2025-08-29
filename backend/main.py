from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from routes import stories, interactive, media
from decouple import config

app = FastAPI(
    title="Smart Cultural Storyteller API",
    description="AI-powered cultural storytelling platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories for static files
os.makedirs("static/images", exist_ok=True)
os.makedirs("static/audio", exist_ok=True)
os.makedirs("uploads", exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(stories.router, prefix="/api/v1/stories", tags=["Stories"])
app.include_router(interactive.router, prefix="/api/v1/interactive", tags=["Interactive"])
app.include_router(media.router, prefix="/api/v1/media", tags=["Media"])

@app.get("/")
async def root():
    return {"message": "Smart Cultural Storyteller API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
