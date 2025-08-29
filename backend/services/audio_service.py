from elevenlabs import generate, set_api_key, Voice, VoiceSettings
from decouple import config
import aiofiles
from models.schemas import Language

class AudioService:
    def __init__(self):
        set_api_key(config('ELEVENLABS_API_KEY', default=''))
        
    async def generate_audio(
        self, 
        text: str, 
        output_path: str, 
        language: Language = Language.ENGLISH,
        voice_style: str = "narrative",
        accent: str = None
    ):
        """Generate audio narration with emotion and cultural authenticity"""
        try:
            # Voice mapping based on language and style
            voice_map = {
                Language.ENGLISH: {
                    "narrative": "Rachel",
                    "dramatic": "Josh",
                    "calm": "Bella",
                    "energetic": "Antoni"
                },
                Language.HINDI: {
                    "narrative": "Prabhat",
                    "dramatic": "Prabhat", 
                    "calm": "Prabhat",
                    "energetic": "Prabhat"
                }
                # Add more language mappings as needed
            }
            
            # Get appropriate voice
            voice_name = voice_map.get(language, voice_map[Language.ENGLISH]).get(voice_style, "Rachel")
            
            # Voice settings for cultural authenticity
            voice_settings = VoiceSettings(
                stability=0.75,
                similarity_boost=0.8,
                style=0.6 if voice_style == "dramatic" else 0.4,
                use_speaker_boost=True
            )
            
            # Generate audio
            audio = generate(
                text=text,
                voice=Voice(
                    voice_id="JBFqnCBsd6RMkjVDRZzb",
                    settings=voice_settings
                ),
                model="eleven_multilingual_v2" if language != Language.ENGLISH else "eleven_monolingual_v1"
            )
            
            # Save audio file
            async with aiofiles.open(output_path, 'wb') as f:
                await f.write(audio)
                
            return True
            
        except Exception as e:
            print(f"Error generating audio: {str(e)}")
            # Create a placeholder file or handle the error appropriately
            return False
