import requests
from decouple import config
import aiofiles
from PIL import Image
import io

class VisualService:
    def __init__(self):
        self.stability_api_key = config('STABILITY_API_KEY', default='')
        
    async def generate_image(self, description: str, output_path: str, style: str = "illustration"):
        """Generate cultural artwork based on story descriptions using Stability AI's SD3.5 model"""
        try:
            # Style-specific prompts
            style_prompts = {
                "illustration": "beautiful cultural illustration, detailed artwork, traditional art style",
                "realistic": "photorealistic, high quality, detailed cultural scene",
                "cartoon": "cartoon style, vibrant colors, family-friendly cultural art",
                "traditional_art": "traditional cultural art style, authentic heritage artwork"
            }
            
            enhanced_prompt = f"{description}, {style_prompts.get(style, style_prompts['illustration'])}, high quality, culturally authentic"
            
            if not self.stability_api_key:
                raise ValueError("Stability API key is not configured")
                
            # Using Stability AI's SD3.5 model
            url = "https://api.stability.ai/v2beta/stable-image/generate/sd3"
            
            headers = {
                "authorization": f"Bearer {self.stability_api_key}",
                "accept": "image/*"
            }
            
            data = {
                "prompt": enhanced_prompt,
                "model": "sd3.5-flash",
                "output_format": "jpeg"
            }
            
            response = requests.post(
                url,
                headers=headers,
                files={"none": ''},  # Required by the API
                data=data
            )
            
            if response.status_code == 200:
                async with aiofiles.open(output_path, 'wb') as f:
                    await f.write(response.content)
                return True
            
            # Fallback: Create a placeholder image
            await self._create_placeholder_image(output_path, description)
            return True
            
        except Exception as e:
            print(f"Error generating image: {str(e)}")
            await self._create_placeholder_image(output_path, "Cultural Story Scene")
            return False
    
    async def _create_placeholder_image(self, output_path: str, text: str):
        """Create a simple placeholder image"""
        try:
            # Create a simple colored placeholder
            img = Image.new('RGB', (512, 512), color='lightblue')
            
            # Save the placeholder
            with open(output_path, 'wb') as f:
                img.save(f, 'PNG')
                
        except Exception as e:
            print(f"Error creating placeholder: {str(e)}")
