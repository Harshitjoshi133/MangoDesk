from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class Language(str, Enum):
    ENGLISH = "en"
    HINDI = "hi"
    SPANISH = "es"
    FRENCH = "fr"
    GERMAN = "de"

class StoryType(str, Enum):
    FOLK_TALE = "folk_tale"
    HISTORICAL = "historical"
    MYTHOLOGY = "mythology"
    CULTURAL_TRADITION = "cultural_tradition"

class StoryInput(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=10)
    story_type: StoryType
    language: Language = Language.ENGLISH
    culture: str = Field(..., min_length=1, max_length=100)
    tags: List[str] = Field(default_factory=list)
    target_age_group: str = Field(default="all", pattern=r"^(children|teens|adults|all)$")

class InteractiveChoice(BaseModel):
    choice_id: str
    choice_text: str
    consequence: str

class StoryResponse(BaseModel):
    story_id: str
    title: str
    enhanced_content: str
    language: Language
    culture: str
    story_type: StoryType
    interactive_enabled: bool = False
    choices: List[InteractiveChoice] = Field(default_factory=list)
    audio_url: Optional[str] = None
    image_url: Optional[str] = None

class InteractiveSession(BaseModel):
    session_id: str
    story_id: str
    current_scene: str
    story_history: List[str] = Field(default_factory=list)
    current_choices: List[InteractiveChoice] = Field(default_factory=list)

class ChoiceSelection(BaseModel):
    session_id: str
    choice_id: str

class AudioRequest(BaseModel):
    text: str
    language: Language = Language.ENGLISH
    voice_style: str = Field(default="narrative", pattern=r"^(narrative|dramatic|calm|energetic)$")
    accent: Optional[str] = None

class VisualRequest(BaseModel):
    description: str
    story_context: str
    style: str = Field(default="illustration", pattern=r"^(illustration|realistic|cartoon|traditional_art)$")
