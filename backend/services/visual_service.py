import requests
from decouple import config
import aiofiles
from PIL import Image
import io

class VisualService:
    def __init__(self):
        self.stability_api_key = config('STABILITY_API_KEY', default='')
        
    async def generate_image(self, description: str, output_path: str, style: str = "illustration"):
        """Generate cultural artwork based on story descriptions"""
        try:
            # Style-specific prompts
            style_prompts = {
                "illustration": "beautiful cultural illustration, detailed artwork, traditional art style",
                "realistic": "photorealistic, high quality, detailed cultural scene",
                "cartoon": "cartoon style, vibrant colors, family-friendly cultural art",
                "traditional_art": "traditional cultural art style, authentic heritage artwork"
            }
            
            enhanced_prompt = f"{description}, {style_prompts.get(style, style_prompts['illustration'])}, high quality, culturally authentic"
            
            # Using Stability AI API (you can replace with other services)
            url = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"
            
            headers = {
                "Authorization": f"Bearer {self.stability_api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "text_prompts": [
                    {
                        "text": enhanced_prompt,
                        "weight": 1
                    }
                ],
                "cfg_scale": 7,
                "height": 1024,
                "width": 1024,
                "samples": 1,
                "steps": 30
            }
            
            if self.stability_api_key:
                response = requests.post(url, json=payload, headers=headers)
                
                if response.status_code == 200:
                    data = response.json()
                    image_data = data["artifacts"][0]["base64"]
                    
                    # Decode and save image
                    import base64
                    image_bytes = base64.b64decode(image_data)
                    
                    async with aiofiles.open(output_path, 'wb') as f:
                        await f.write(image_bytes)
                    
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
