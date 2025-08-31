from fastapi import APIRouter, HTTPException
from typing import Dict
import uuid
from models.schemas import InteractiveSession, ChoiceSelection, InteractiveChoice
from services.gemini_service import GeminiService

router = APIRouter()
gemini_service = GeminiService()

# In-memory storage for interactive sessions
sessions_db: Dict[str, dict] = {}
@router.post("/start/{story_id}")
async def start_interactive_session(story_id: str):
    """Start a new interactive storytelling session"""
    try:
        # Import here to avoid circular imports
        from routes.stories import stories_db
        
        if story_id not in stories_db:
            raise HTTPException(status_code=404, detail="Story not found")
        
        session_id = str(uuid.uuid4())
        story = stories_db[story_id]
        
        # Ensure choices have the required fields
        choices = [
            {
                "choice_id": f"choice_{i+1}",
                "choice_text": choice.get("choice_text", f"Choice {i+1}"),
                "consequence": choice.get("consequence", f"You chose option {i+1}")
            }
            for i, choice in enumerate(story.get("choices", []))
        ]
        
        session = InteractiveSession(
            session_id=session_id,
            story_id=story_id,
            current_scene=story["enhanced_content"][:500],
            story_history=[story["enhanced_content"][:500]],
            current_choices=choices
        )
        
        sessions_db[session_id] = session.model_dump()
        
        return {
            "session_id": session_id,
            "current_scene": session.current_scene,
            "choices": choices  # Ensure this matches the expected format
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting session: {str(e)}")
@router.post("/choose")
async def make_choice(choice_selection: ChoiceSelection):
    """Make a choice in an interactive story"""
    try:
        session_id = choice_selection.session_id
        
        if session_id not in sessions_db:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = sessions_db[session_id]
        
        # Find the selected choice
        selected_choice = None
        for choice in session["current_choices"]:
            if choice["choice_id"] == choice_selection.choice_id:
                selected_choice = choice
                break
        
        if not selected_choice:
            raise HTTPException(status_code=400, detail="Invalid choice ID")
        
        # Generate story continuation based on choice
        story_continuation = await gemini_service.continue_interactive_story(
            session["story_history"],
            selected_choice["consequence"]
        )
        
        # Generate new choices for the next scene
        new_choices = await gemini_service.generate_interactive_choices(
            story_continuation
        )
        
        # Update session
        session["story_history"].append(f"Choice: {selected_choice['choice_text']}")
        session["story_history"].append(story_continuation)
        session["current_scene"] = story_continuation
        session["current_choices"] = [choice.model_dump() for choice in new_choices]
        
        sessions_db[session_id] = session
        
        return {
            "session_id": session_id,
            "previous_choice": selected_choice,
            "current_scene": story_continuation,
            "choices": new_choices
        }
        
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail=f"Error making choice: {str(e)}")

@router.get("/session/{session_id}")
async def get_session(session_id: str):
    """Get current session state"""
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions_db[session_id]
    return {
        "session_id": session_id,
        "current_scene": session["current_scene"],
        "choices": session["current_choices"],
        "history_length": len(session["story_history"])
    }

@router.get("/session/{session_id}/history")
async def get_session_history(session_id: str):
    """Get full session history"""
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session_id,
        "history": sessions_db[session_id]["story_history"]
    }

@router.delete("/session/{session_id}")
async def end_session(session_id: str):
    """End an interactive session"""
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="Session not found")
    
    del sessions_db[session_id]
    return {"message": "Session ended successfully"}

@router.post("/session/{session_id}/restart")
async def restart_session(session_id: str):
    """Restart a session from the beginning"""
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="Session not found")
    
    try:
        session = sessions_db[session_id]
        story_id = session["story_id"]
        
        # Delete current session and start new one
        del sessions_db[session_id]
        return await start_interactive_session(story_id)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error restarting session: {str(e)}")
