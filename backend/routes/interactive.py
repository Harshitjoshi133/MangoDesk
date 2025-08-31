from fastapi import APIRouter, HTTPException, Request
from typing import Dict
import uuid
from models.schemas import InteractiveSession, ChoiceSelection, InteractiveChoice
from services.gemini_service import GeminiService

router = APIRouter()
gemini_service = GeminiService()

# In-memory storage for interactive sessions
sessions_db: Dict[str, dict] = {}

@router.post("/start/{story_id}")
async def start_interactive_session(story_id: str, request: Request):
    """Start a new interactive storytelling session"""
    try:
        # Get language from request body or headers
        request_data = await request.json() if request.method == "POST" and request.headers.get("content-type") == "application/json" else {}
        language = request_data.get('language') or request.headers.get('accept-language', 'en').split(',')[0].split('-')[0]
        
        # Import here to avoid circular imports
        from routes.stories import stories_db
        
        if story_id not in stories_db:
            raise HTTPException(status_code=404, detail="Story not found")
        
        session_id = str(uuid.uuid4())
        story = stories_db[story_id]
        
        # Set language for the story
        story["language"] = language
        
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
            current_choices=choices,
            language=language
        )
        
        sessions_db[session_id] = session.model_dump()
        
        return {
            "session_id": session_id,
            "current_scene": session.current_scene,
            "choices": choices,
            "language": language
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting session: {str(e)}")

@router.post("/choose")
async def make_choice(choice_selection: ChoiceSelection, request: Request):
    """Make a choice in an interactive story"""
    try:
        session_id = choice_selection.session_id
        choice_id = choice_selection.choice_id
        
        if session_id not in sessions_db:
            raise HTTPException(status_code=404, detail="Session not found")
            
        session_data = sessions_db[session_id]
        session = InteractiveSession(**session_data)
        
        # Get the selected choice
        selected_choice = next(
            (choice for choice in session.current_choices if choice["choice_id"] == choice_id),
            None
        )
        
        if not selected_choice:
            raise HTTPException(status_code=400, detail="Invalid choice")
        
        # Get the story
        from routes.stories import stories_db
        story = stories_db.get(session.story_id)
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        
        # Generate the next segment based on the choice
        # This is where you would typically call your LLM to generate the next part of the story
        # For now, we'll just create a simple response
        next_scene = f"You chose: {selected_choice['choice_text']}. The story continues..."
        
        # Update session
        session.story_history.append(next_scene)
        session.current_scene = next_scene
        session.previous_choice = selected_choice
        
        # Generate new choices (in a real app, these would come from your LLM)
        new_choices = [
            {
                "choice_id": f"choice_{i+1}",
                "choice_text": f"Option {i+1} for '{selected_choice['choice_text']}'",
                "consequence": f"You chose option {i+1} after {selected_choice['choice_text']}"
            }
            for i in range(2)  # Just 2 options for simplicity
        ]
        
        session.current_choices = new_choices
        
        # Save updated session
        sessions_db[session_id] = session.model_dump()
        
        return {
            "session_id": session_id,
            "current_scene": session.current_scene,
            "choices": session.current_choices,
            "previous_choice": session.previous_choice,
            "language": getattr(session, 'language', 'en')  # Default to English if not set
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing choice: {str(e)}")

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
        "history_length": len(session["story_history"]),
        "language": session.get("language", "en")  # Default to English if not set
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
