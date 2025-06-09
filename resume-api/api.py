from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from analyser_core import (
    extract_text_from_file,
    feature_match_function,
    suggested_changes_function,
    apply_changes_function,
    custom_prompt_function,
    match_report,
    create_radar_chart_base64
)
import tempfile
import shutil
import google.generativeai as genai
from dotenv import load_dotenv 
import os
import json

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Gemini 1.5 Flash
gemini_model = genai.GenerativeModel("models/gemini-1.5-flash-latest")

app = FastAPI()

# Allow CORS for frontend React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    resume_text: str
    job_offer_text: str
    job_title: str
    model_name: str
    provider: str
    api_key: str
    temperature: float

@app.post("/custom_prompt")
def custom_prompt(request: AnalysisRequest, user_prompt: str = Form(...)):
    model = ChatUnify(
        model=f"{request.model_name}@{request.provider}",
        unify_api_key=request.api_key,
        temperature=request.temperature
    )
    answer = custom_prompt_function(
        user_prompt=user_prompt,
        resume_text=request.resume_text,
        job_offer=request.job_offer_text,
        job_title=request.job_title,
        model=model
    )
    return {"answer": answer}

@app.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    with open(tmp_path, "rb") as f:
        text = extract_text_from_file(f, file.filename)  
    return {"resume_text": text}

@app.post("/analyze-with-chart")
def analyze_with_chart(request: AnalysisRequest):
    answer = feature_match_function(
        resume_text=request.resume_text,
        job_offer=request.job_offer_text,
        model=gemini_model  
    )
    summary, scores = match_report(answer)
    chart_base64 = create_radar_chart_base64(scores)
    return {
        "summary": summary,
        "scores": scores,
        "chart_base64": chart_base64
    }

@app.post("/suggest")
def suggest_changes(request: AnalysisRequest):
    suggestions = suggested_changes_function(
        resume_text=request.resume_text,
        job_offer=request.job_offer_text,
        model=gemini_model
    )
    return {
        "suggestions": suggestions
    }

@app.post("/apply")
def apply_suggestions(
    resume_text: str = Form(...),
    job_offer_text: str = Form(...),
    job_title: str = Form(...),
    model_name: str = Form(...),
    provider: str = Form(...),
    api_key: str = Form(...),
    temperature: float = Form(...),
    suggestions: str = Form(...)
):
    updated_resume = apply_changes_function(
        resume_text=resume_text,
        job_offer=job_offer_text,
        suggested_changes=suggestions,
        model=gemini_model  
    )
    return {"updated_resume": updated_resume}
