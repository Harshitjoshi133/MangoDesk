from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import google.genai as genai
import os
import smtplib
from email.mime.text import MIMEText
from typing import List
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS middleware to allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini API

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file")
client = genai.Client(api_key=GEMINI_API_KEY)



class EmailSchema(BaseModel):
    summary: str
    recipients: List[EmailStr]

@app.post("/summarize")
async def summarize(transcript: UploadFile = File(...), custom_prompt: str = Form(...)):
    if not transcript.content_type.startswith('text/'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a .txt file.")
    
    transcript_content = await transcript.read()
    transcript_text = transcript_content.decode('utf-8')
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash-001',
            contents=[f'Could you summarize this file?{custom_prompt}', transcript_text]
        )
        return {"summary": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")

@app.post("/send-email")
async def send_email(email_data: EmailSchema):
    try:
        GMAIL_USER = os.getenv("GMAIL_USER")
        GMAIL_PASSWORD = os.getenv("GMAIL_PASSWORD")

        if not GMAIL_USER or not GMAIL_PASSWORD:
            raise HTTPException(status_code=500, detail="Gmail credentials not configured in .env file")

        msg = MIMEText(email_data.summary)
        msg['Subject'] = 'Meeting Summary'
        msg['From'] = GMAIL_USER
        msg['To'] = ", ".join(email_data.recipients)

        try:
            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp_server:
                smtp_server.login(GMAIL_USER, GMAIL_PASSWORD)
                smtp_server.sendmail(GMAIL_USER, email_data.recipients, msg.as_string())
            return {"message": "Email sent successfully"}
        except Exception as e:
            logging.error(f"Error sending email: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error sending email: {str(e)}")
    except Exception as e:
        logging.error(f"Error sending email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error sending email: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
