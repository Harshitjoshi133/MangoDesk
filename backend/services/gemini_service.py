import google.generativeai as genai
from decouple import config
from typing import List, Dict, Any
import json
from models.schemas import StoryInput, InteractiveChoice, Language

class GeminiService:
    def __init__(self):
        genai.configure(api_key=config('GEMINI_API_KEY'))
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
    async def enhance_story(self, story_input: StoryInput) -> Dict[str, Any]:
        """Enhance the original story with cultural context and better narrative"""
        prompt = f"""
        You are a master storyteller specializing in cultural narratives. 
        
        Original Story Details:
        - Title: {story_input.title}
        - Type: {story_input.story_type}
        - Culture: {story_input.culture}
        - Language: {story_input.language}
        - Target Age: {story_input.target_age_group}
        - Content: {story_input.content}
        
        Please enhance this story by:
        1. Improving the narrative flow and engagement
        2. Adding authentic cultural details and context
        3. Making it appropriate for the target age group
        4. Preserving the original cultural essence
        5. Making it more vivid and immersive
        
        Return only the enhanced story content, maintaining cultural authenticity.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return {
                "enhanced_content": response.text,
                "success": True
            }
        except Exception as e:
            return {
                "enhanced_content": story_input.content,
                "success": False,
                "error": str(e)
            }

    async def generate_interactive_choices(self, story_content: str, current_scene: str = None) -> List[InteractiveChoice]:
        """Generate interactive choices for choose-your-own-adventure style storytelling"""
        scene_context = current_scene if current_scene else story_content[:500]
        
        prompt = f"""
        Based on this story context: "{scene_context}"
        
        Generate exactly 3 meaningful choices for the reader that would lead to different story paths.
        Each choice should:
        1. Be engaging and culturally appropriate
        2. Lead to a distinct narrative direction
        3. Maintain the story's cultural authenticity
        
        Format your response as a JSON array with this structure:
        [
            {{
                "choice_id": "choice_1",
                "choice_text": "Clear, engaging choice description",
                "consequence": "Brief description of what happens next"
            }}
        ]
        """
        
        try:
            response = self.model.generate_content(prompt)
            choices_data = json.loads(response.text)
            return [InteractiveChoice(**choice) for choice in choices_data]
        except Exception as e:
            # Fallback choices
            return [
                InteractiveChoice(
                    choice_id="choice_1",
                    choice_text="Continue with the traditional path",
                    consequence="The story follows its original course"
                ),
                InteractiveChoice(
                    choice_id="choice_2",
                    choice_text="Explore a different perspective",
                    consequence="The story takes an alternative direction"
                ),
                InteractiveChoice(
                    choice_id="choice_3",
                    choice_text="Ask the elder for wisdom",
                    consequence="Gain deeper cultural insights"
                )
            ]

    async def continue_interactive_story(self, story_history: List[str], chosen_path: str) -> str:
        """Continue the story based on user's choice"""
        try:
            # Get the last few story segments for context
            context = "\n".join(story_history[-3:])  # Use last 3 segments for context
            
            prompt = f"""
            Story so far:
            {context}
            
            The reader chose: "{chosen_path}"
            
            Continue the story in 2-3 engaging paragraphs that:
            1. Acknowledge the choice
            2. Develop the story naturally
            3. End with a new situation or decision point
            4. Maintain cultural authenticity
            
            Write in a narrative style that matches the story's tone.
            """
            
            response = self.model.generate_content(prompt)
            
            if not hasattr(response, 'text') or not response.text.strip():
                raise ValueError("Empty response from model")
                
            # Clean up the response
            continuation = response.text.strip()
            
            # Remove any markdown code blocks if present
            if continuation.startswith('```'):
                continuation = continuation[continuation.find('\n')+1:continuation.rfind('```')].strip()
                
            return continuation
            
        except Exception as e:
            print(f"Error continuing story: {str(e)}")
            # Return a fallback continuation
            return f"The story continues as you chose: {chosen_path}. The narrative unfolds in unexpected ways, leading to new adventures and challenges."

    async def translate_story(self, content: str, target_language: Language) -> str:
        """Translate story content while preserving cultural context"""
        language_map = {
            Language.ENGLISH: "English",
            Language.HINDI: "Hindi",
            Language.SPANISH: "Spanish",
            Language.FRENCH: "French",
            Language.GERMAN: "German"
        }
        
        target_lang = language_map.get(target_language, "English")
        
        prompt = f"""
        Translate the following cultural story to {target_lang} while:
        1. Preserving all cultural references and context
        2. Maintaining the story's emotional tone
        3. Keeping cultural terms that don't have direct translations (with brief explanations)
        4. Ensuring the translation is natural and engaging
        
        Story to translate: {content}
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return content

    async def generate_visual_description(self, story_content: str, scene_context: str = None) -> str:
        """Generate detailed visual descriptions for image generation"""
        context = scene_context if scene_context else story_content[:300]
        
        prompt = f"""
        Based on this story context: "{context}"
        
        Create a detailed visual description suitable for AI image generation that captures:
        1. The cultural setting and atmosphere
        2. Key characters and their traditional attire
        3. Important cultural artifacts or symbols
        4. The mood and tone of the scene
        5. Traditional architectural or natural elements
        
        Keep the description concise but vivid, focusing on visual elements that represent the culture authentically.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"A cultural scene depicting {context}"
