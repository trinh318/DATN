import json
from PyPDF2 import PdfReader
from docx import Document
from math import pi
import matplotlib
matplotlib.use('Agg')  # ← Dùng backend không cần GUI
import matplotlib.pyplot as plt
import io
import base64
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("models/gemini-1.5-flash-latest")

# 📌 1. Trích xuất text từ resume
def extract_text_from_file(file, filename):
    file_extension = filename.split('.')[-1].lower()
    if file_extension == 'pdf':
        text = ""
        pdf_reader = PdfReader(file)
        for page in pdf_reader.pages:
            text += page.extract_text() or ""
        return text
    elif file_extension == 'docx':
        text = ""
        doc = Document(file)
        for paragraph in doc.paragraphs:
            text += paragraph.text + '\n'
        return text
    else:
        raise ValueError("Unsupported file type")

# 📌 2. Hàm phân tích resume và job offer
def feature_match_function(resume_text, job_offer, model):
    prompt = f"""You are an AI assistant powered by a Language Model, designed to provide guidance for enhancing and optimizing resumes. 
            Your task is to review the provided resume against the given job offer description. 
            Follow the steps below in order to complete the task:

            Step 1: Identify and list:
                - Matching soft skills
                - Matching hard skills
                - Relevant experiences for the position
                - Matching qualifications (education and certifications)
                - Other relevant keywords

            Step 2: Assign a score from 1 to 100 for each category based on how well the resume matches the job offer. Provide the scores in the specified format without any modifications.

            Step 3: Provide the output in two parts:
            1. An analysis summary of how the candidate's profile aligns with the role description in the job offer. Highlight the strengths and weaknesses of the applicant in relation to the specified job offer description.
            2. A JSON format detailing the identified matches and their scores in each category using the template below. Ensure that the JSON format is strictly followed to avoid parsing errors:
                {{
                "Soft skills": <soft_skills_score>,
                "Hard skills": <hard_skills_score>,
                "Experience": <experience_score>,
                "Education and certifications": <education_and_certifications_score>,
                "Keywords": <keywords_score>
                }}
                
            Resume Text: {resume_text}
            Job Offer: {job_offer}

            Ensure that the JSON output is correctly formatted and can be parsed without errors.
            """
    response = model.generate_content(prompt)
    return response.text

# 📌 3. Tách JSON và tóm tắt từ phản hồi Gemini
def match_report(match_answer):
    json_start = match_answer.index("{")
    json_end = match_answer.rindex("}") + 1
    json_part = match_answer[json_start:json_end]
    text_analysis = match_answer[:json_start].strip()
    scores_dict = json.loads(json_part)
    return text_analysis, scores_dict

# 📌 4. Gợi ý chỉnh sửa
def suggested_changes_function(resume_text, job_offer, model):
    prompt = f"""You are an AI assistant designed to enhance and optimize resumes to better match specific job offers. 
            Your task is to review the provided resume in light of the given job offer description and provide detailed suggestions for improvement.
        
            Follow these steps in order:
            1. Extract and list keywords from both the job offer and the resume.
            2. Identify and list matching soft skills, hard skills, qualifications, and experiences between the resume and the job offer.
            3. Identify missing keywords in the resume that are present in the job offer.
            4. Identify keywords and skills implied by the resume that could be explicitly added.
            5. Identify missing experiences in the resume that are implied and could be explicitly added.

            Output a suggestions list using the following format and nothing else:
                A. Rephrasing suggestions:
                - <bullet-point list of rephrasing suggestions>
                
                B. Adding keywords and skills:
                - <bullet-point list of additional keywords and skills>
                
                C. Adding missing experiences:
                - <bullet-point list of additional experiences>

            Ensure that the suggestions are highly relevant to the job offer, contextually appropriate, professionally beneficial, and they avoid redundant or unnecessary additions. Do not include any other text or explanations outside the specified format.

            resume_text: {resume_text}
            job_offer: {job_offer}
            """
    response = model.generate_content(prompt)
    return response.text

# 📌 5. Áp dụng thay đổi
def apply_changes_function(resume_text, job_offer, suggested_changes, model):
    prompt = f"""You are an AI assistant designed to enhance and optimize resumes to better match specific job offers.
        Given a resume ({resume_text}) and a report with suggested changes ({suggested_changes}), you will apply the changes to create an updated new resume:
            
            1. Add the suggested changes from {suggested_changes} to the new resume, ensuring they fit naturally and contextually.
            2. Apply the rephrasing suggestions while maintaining the overall coherence and focus of the resume.
            3. Verify that the updated resume keep all the existing keywords, skills, qualifications, and experiences from the {resume_text} that are valuable for the job offer ({job_offer}).
            4. Ensure that the new resume is well-structured, concise, and tailored to the job offer

        Return the updated resume as the final output.

        resume_text: {resume_text}
        job_offer: {job_offer}
        suggested_changes: {suggested_changes}
        """
    response = model.generate_content(prompt)
    return response.text

# 📌 6. Prompt tùy chỉnh
def custom_prompt_function(user_prompt, resume_text, job_offer, job_title):
    prompt = f"""You are an AI assistant designed to enhance and optimize resumes to better match specific job offers.
        Given the user prompt as a query to answer and use the resume, job offer, and job title as context to provide a short answer that addresses the user's query.
        user_prompt: {user_prompt}
        resume_text: {resume_text}
        job_offer: {job_offer}
        job_title: {job_title}
        """
    response = model.generate_content(prompt)
    return response.text

# 📌 7. Tạo radar chart (giữ nguyên)
def create_radar_chart_base64(scores_dict):
    categories = ["Soft skills", "Hard skills", "Experience", "Education and certifications", "Keywords"]
    scores = [
        scores_dict.get("soft_skills_score") or scores_dict.get("Soft skills", 0),
        scores_dict.get("hard_skills_score") or scores_dict.get("Hard skills", 0),
        scores_dict.get("experience_score") or scores_dict.get("Experience", 0),
        scores_dict.get("Education and certifications", 0),
        scores_dict.get("keywords_score") or scores_dict.get("Keywords", 0)
    ]
    scores += scores[:1]
    angles = [n / float(len(categories)) * 2 * pi for n in range(len(categories))]
    angles += angles[:1]

    fig, ax = plt.subplots(figsize=(6, 6), subplot_kw=dict(polar=True))
    ax.plot(angles, scores, linewidth=2, linestyle='solid')
    ax.fill(angles, scores, 'r', alpha=0.25)
    plt.xticks(angles[:-1], categories)
    ax.set_rlabel_position(30)
    plt.yticks([20, 40, 60, 80, 100], ["20", "40", "60", "80", "100"], color="grey", size=7)
    plt.ylim(0, 100)

    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches='tight')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode("utf-8")
    buf.close()
    plt.close(fig)
    return img_base64
 