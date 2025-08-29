from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import List, Optional
import uuid
import json
import aiofiles
from models.schemas import StoryInput, StoryResponse, Language, StoryType
from services.gemini_service import GeminiService

router = APIRouter()
gemini_service = GeminiService()

# In-memory storage (replace with database in production)
stories_db = {}

@router.post("/create", response_model=StoryResponse)
async def create_story(story_input: StoryInput):
    """Create a new enhanced story"""
    try:
        story_id = str(uuid.uuid4())
        
        # Enhance the story using Gemini
        enhancement_result = await gemini_service.enhance_story(story_input)
        
        # Generate initial interactive choices
        choices = await gemini_service.generate_interactive_choices(
            enhancement_result["enhanced_content"]
        )
        
        story_response = StoryResponse(
            story_id=story_id,
            title=story_input.title,
            enhanced_content=enhancement_result["enhanced_content"],
            language=story_input.language,
            culture=story_input.culture,
            story_type=story_input.story_type,
            interactive_enabled=True,
            choices=choices
        )
        
        # Store in database
        stories_db[story_id] = story_response.model_dump()
        
        return story_response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating story: {str(e)}")

@router.post("/upload")
async def upload_story_file(
    file: UploadFile = File(...),
    title: str = Form(...),
    story_type: StoryType = Form(...),
    language: Language = Form(Language.ENGLISH),
    culture: str = Form(...),
    target_age_group: str = Form("all")
):
    """Upload story from text file"""
    try:
        # Read file content
        content = await file.read()
        story_content = content.decode('utf-8')
        
        # Create story input
        story_input = StoryInput(
            title=title,
            content=story_content,
            story_type=story_type,
            language=language,
            culture=culture,
            target_age_group=target_age_group
        )
        
        # Use the create_story function
        return await create_story(story_input)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading story: {str(e)}")

@router.get("/list")
async def list_stories(
    language: Optional[Language] = None,
    story_type: Optional[StoryType] = None,
    culture: Optional[str] = None
):
    """List all stories with optional filtering"""
    try:
        stories = list(stories_db.values())
        
        # Apply filters
        if language:
            stories = [s for s in stories if s["language"] == language]
        if story_type:
            stories = [s for s in stories if s["story_type"] == story_type]
        if culture:
            stories = [s for s in stories if culture.lower() in s["culture"].lower()]
        
        return {
            "stories": stories,
            "total": len(stories)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing stories: {str(e)}")

@router.get("/{story_id}", response_model=StoryResponse)
async def get_story(story_id: str):
    """Get a specific story by ID"""
    if story_id not in stories_db:
        raise HTTPException(status_code=404, detail="Story not found")
    
    return StoryResponse(**stories_db[story_id])

@router.post("/{story_id}/translate")
async def translate_story(story_id: str, target_language: Language):
    """Translate a story to a different language"""
    if story_id not in stories_db:
        raise HTTPException(status_code=404, detail="Story not found")
    
    try:
        story = stories_db[story_id]
        translated_content = await gemini_service.translate_story(
            story["enhanced_content"], 
            target_language
        )
        
        # Create new story with translation
        new_story_id = str(uuid.uuid4())
        translated_story = story.copy()
        translated_story.update({
            "story_id": new_story_id,
            "enhanced_content": translated_content,
            "language": target_language
        })
        
        stories_db[new_story_id] = translated_story
        
        return StoryResponse(**translated_story)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error translating story: {str(e)}")

@router.delete("/{story_id}")
async def delete_story(story_id: str):
    """Delete a story"""
    if story_id not in stories_db:
        raise HTTPException(status_code=404, detail="Story not found")
    
    del stories_db[story_id]
    return {"message": "Story deleted successfully"}

@router.put("/{story_id}")
async def update_story(story_id: str, story_input: StoryInput):
    """Update an existing story"""
    if story_id not in stories_db:
        raise HTTPException(status_code=404, detail="Story not found")
    
    try:
        # Re-enhance the updated story
        enhancement_result = await gemini_service.enhance_story(story_input)
        choices = await gemini_service.generate_interactive_choices(
            enhancement_result["enhanced_content"]
        )
        
        updated_story = StoryResponse(
            story_id=story_id,
            title=story_input.title,
            enhanced_content=enhancement_result["enhanced_content"],
            language=story_input.language,
            culture=story_input.culture,
            story_type=story_input.story_type,
            interactive_enabled=True,
            choices=choices
        )
        
        stories_db[story_id] = updated_story.model_dump()
        return updated_story
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating story: {str(e)}")
