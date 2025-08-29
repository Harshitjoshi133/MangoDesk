from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
import aiofiles
import uuid
import os
from models.schemas import AudioRequest, VisualRequest
from services.audio_service import AudioService
from services.visual_service import VisualService
from services.gemini_service import GeminiService

router = APIRouter()
audio_service = AudioService()
visual_service = VisualService()
gemini_service = GeminiService()

@router.post("/generate-audio")
async def generate_audio(audio_request: AudioRequest, background_tasks: BackgroundTasks):
    """Generate audio narration for story content"""
    try:
        audio_id = str(uuid.uuid4())
        audio_filename = f"audio_{audio_id}.mp3"
        audio_path = f"static/audio/{audio_filename}"
        
        # Generate audio in background
        background_tasks.add_task(
            audio_service.generate_audio,
            audio_request.text,
            audio_path,
            audio_request.language,
            audio_request.voice_style,
            audio_request.accent
        )
        
        return {
            "audio_id": audio_id,
            "status": "generating",
            "audio_url": f"/static/audio/{audio_filename}",
            "message": "Audio generation started. Check status endpoint for progress."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating audio: {str(e)}")

@router.post("/generate-visual")
async def generate_visual(visual_request: VisualRequest, background_tasks: BackgroundTasks):
    """Generate visual content for story scenes"""
    try:
        # First, enhance the description using Gemini
        enhanced_description = await gemini_service.generate_visual_description(
            visual_request.description,
            visual_request.story_context
        )
        
        image_id = str(uuid.uuid4())
        image_filename = f"image_{image_id}.png"
        image_path = f"static/images/{image_filename}"
        
        # Generate image in background
        background_tasks.add_task(
            visual_service.generate_image,
            enhanced_description,
            image_path,
            visual_request.style
        )
        
        return {
            "image_id": image_id,
            "status": "generating",
            "image_url": f"/static/images/{image_filename}",
            "enhanced_description": enhanced_description,
            "message": "Image generation started. Check status endpoint for progress."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating visual: {str(e)}")

@router.get("/audio/{filename}")
async def get_audio(filename: str):
    """Serve generated audio files"""
    file_path = f"static/audio/{filename}"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    return FileResponse(file_path, media_type="audio/mpeg")

@router.get("/image/{filename}")
async def get_image(filename: str):
    """Serve generated image files"""
    file_path = f"static/images/{filename}"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image file not found")
    
    return FileResponse(file_path, media_type="image/png")

@router.post("/story/{story_id}/generate-complete-media")
async def generate_complete_media(story_id: str, background_tasks: BackgroundTasks):
    """Generate both audio and visual content for a complete story"""
    try:
        from routes.stories import stories_db
        
        if story_id not in stories_db:
            raise HTTPException(status_code=404, detail="Story not found")
        
        story = stories_db[story_id]
        
        # Generate audio
        audio_request = AudioRequest(
            text=story["enhanced_content"],
            language=story["language"],
            voice_style="narrative"
        )
        
        # Generate visual
        visual_request = VisualRequest(
            description=story["enhanced_content"][:200],
            story_context=f"{story['culture']} {story['story_type']}",
            style="illustration"
        )
        
        # Generate both in background
        audio_id = str(uuid.uuid4())
        image_id = str(uuid.uuid4())
        
        audio_filename = f"story_audio_{audio_id}.mp3"
        image_filename = f"story_image_{image_id}.png"
        
        background_tasks.add_task(
            audio_service.generate_audio,
            audio_request.text,
            f"static/audio/{audio_filename}",
            audio_request.language,
            audio_request.voice_style
        )
        
        enhanced_description = await gemini_service.generate_visual_description(
            visual_request.description,
            visual_request.story_context
        )
        
        background_tasks.add_task(
            visual_service.generate_image,
            enhanced_description,
            f"static/images/{image_filename}",
            visual_request.style
        )
        
        # Update story with media URLs
        stories_db[story_id]["audio_url"] = f"/static/audio/{audio_filename}"
        stories_db[story_id]["image_url"] = f"/static/images/{image_filename}"
        
        return {
            "story_id": story_id,
            "audio_url": f"/static/audio/{audio_filename}",
            "image_url": f"/static/images/{image_filename}",
            "status": "generating",
            "message": "Media generation started for complete story"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating complete media: {str(e)}")

@router.get("/status/{media_id}")
async def get_media_status(media_id: str, media_type: str):
    """Check the status of media generation"""
    if media_type == "audio":
        file_path = f"static/audio/audio_{media_id}.mp3"
    elif media_type == "image":
        file_path = f"static/images/image_{media_id}.png"
    else:
        raise HTTPException(status_code=400, detail="Invalid media type")
    
    if os.path.exists(file_path):
        return {
            "media_id": media_id,
            "status": "completed",
            "file_size": os.path.getsize(file_path)
        }
    else:
        return {
            "media_id": media_id,
            "status": "processing"
        }
