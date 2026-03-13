from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import sys
import os

# Add question-generator folder to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'question-generator'))
from question_generator import generate_questions, generate_jd_questions, generate_company_questions

# Add ai-tutor folder to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'ai-tutor'))
from tutor import (
    teach_concept,
    answer_followup,
    suggest_related_topics,
    validate_student_answer
)
from speech import SpeechTranscript

app = FastAPI(
    title="MegaHack 2026 - AI Backend API",
    description="AI Question Generator + AI Tutor with Text & Voice support",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionRequest(BaseModel):
    topic: str
    difficulty: str
    job_description: str
    num_questions: int = 5

@app.post("/api/generate-questions")
async def generate_questions_api(request: QuestionRequest):
    try:
        if request.num_questions > 20:
            raise HTTPException(status_code=400, detail="Maximum 20 questions allowed per request.")
            
        result = generate_questions(
            topic=request.topic,
            difficulty=request.difficulty,
            job_description=request.job_description,
            num_questions=request.num_questions
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class JDQuestionRequest(BaseModel):
    role: str
    skills: str
    experience: str
    difficulty: str
    num_questions: int = 5

@app.post("/api/generate/jd")
async def generate_jd_questions_api(request: JDQuestionRequest):
    try:
        if request.num_questions > 20:
            raise HTTPException(status_code=400, detail="Maximum 20 questions allowed per request.")
            
        result = generate_jd_questions(
            role=request.role,
            skills=request.skills,
            experience=request.experience,
            difficulty=request.difficulty,
            num_questions=request.num_questions
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class CompanyQuestionRequest(BaseModel):
    company: str
    role: str
    difficulty: str
    num_questions: int = 5

@app.post("/api/generate/company")
async def generate_company_questions_api(request: CompanyQuestionRequest):
    try:
        if request.num_questions > 20:
            raise HTTPException(status_code=400, detail="Maximum 20 questions allowed per request.")
            
        result = generate_company_questions(
            company=request.company,
            role=request.role,
            difficulty=request.difficulty,
            num_questions=request.num_questions
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {
        "message": "Welcome to MegaHack 2026 AI Backend",
        "endpoints": {
            "question_generator": ["/api/generate-questions", "/api/generate/jd", "/api/generate/company"],
            "ai_tutor": [
                "/api/tutor/explain",
                "/api/tutor/explain-voice",
                "/api/tutor/followup",
                "/api/tutor/related-topics",
                "/api/tutor/validate-answer"
            ]
        }
    }

# ===============================
# AI TUTOR ENDPOINTS
# ===============================

class TutorRequest(BaseModel):
    query: str  # The concept/topic the student wants to learn

@app.post("/api/tutor/explain")
async def explain_concept(request: TutorRequest):
    """
    Text-based AI Tutor endpoint.
    Send a topic or concept and receive a structured teaching response.
    Example: {"query": "Binary Search"}
    """
    try:
        if not request.query.strip():
            raise HTTPException(status_code=400, detail="Query cannot be empty.")
        if len(request.query) > 500:
            raise HTTPException(status_code=400, detail="Query too long. Max 500 characters.")

        result = teach_concept(query=request.query)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tutor/explain-voice")
async def explain_concept_voice(request: SpeechTranscript):
    """
    Voice-based AI Tutor endpoint.
    The frontend sends a speech transcript and receives the same structured teaching response.
    The Web Speech API handles voice capture on the frontend side.
    Example: {"transcript": "Binary Search", "language": "en-US"}
    """
    try:
        query = request.transcript.strip()
        if not query:
            raise HTTPException(status_code=400, detail="Speech transcript is empty.")
        if len(query) > 500:
            raise HTTPException(status_code=400, detail="Transcript too long. Max 500 characters.")

        result = teach_concept(query=query)
        # Tag it so frontend knows how the query came in
        result["input_mode"] = "voice"
        result["transcript"] = query
        result["language"] = request.language
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from typing import List, Optional
from pydantic import BaseModel as PydanticBase

class ChatMessage(PydanticBase):
    role: str  # 'human' or 'ai'
    content: str

class FollowUpRequest(PydanticBase):
    topic: str
    followup_question: str
    chat_history: Optional[List[ChatMessage]] = []  # Prior messages for context

@app.post("/api/tutor/followup")
async def tutor_followup(request: FollowUpRequest):
    """
    Chatbot-style follow-up endpoint.
    Send a topic, a follow-up question, and prior chat_history for context.
    Example:
    {
      "topic": "Binary Search",
      "followup_question": "Why can't we use binary search on unsorted arrays?",
      "chat_history": [
        {"role": "human", "content": "What is Binary Search?"},
        {"role": "ai", "content": "Binary search finds an element in a sorted array..."}
      ]
    }
    """
    try:
        if not request.followup_question.strip():
            raise HTTPException(status_code=400, detail="Follow-up question cannot be empty.")
        history = [m.model_dump() for m in request.chat_history] if request.chat_history else []
        result = answer_followup(
            topic=request.topic,
            followup_question=request.followup_question,
            chat_history=history
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class RelatedTopicsRequest(PydanticBase):
    topic: str
    level: Optional[str] = "beginner"  # beginner, intermediate, advanced

@app.post("/api/tutor/related-topics")
async def tutor_related_topics(request: RelatedTopicsRequest):
    """
    Returns a structured learning path after studying a topic.
    Example: {"topic": "Binary Search", "level": "beginner"}
    """
    try:
        if not request.topic.strip():
            raise HTTPException(status_code=400, detail="Topic cannot be empty.")
        result = suggest_related_topics(topic=request.topic, level=request.level or "beginner")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ValidateAnswerRequest(PydanticBase):
    topic: str
    practice_question: str
    correct_solution: str
    student_answer: str

@app.post("/api/tutor/validate-answer")
async def tutor_validate_answer(request: ValidateAnswerRequest):
    """
    Evaluates a student's answer to any practice question.
    Returns a score out of 10 and constructive feedback.
    Example:
    {
      "topic": "Binary Search",
      "practice_question": "What is the time complexity of binary search?",
      "correct_solution": "O(log n) because we halve the search space each iteration.",
      "student_answer": "O(log n)"
    }
    """
    try:
        for field_name, value in [("topic", request.topic), ("practice_question", request.practice_question),
                                  ("correct_solution", request.correct_solution), ("student_answer", request.student_answer)]:
            if not value.strip():
                raise HTTPException(status_code=400, detail=f"{field_name} cannot be empty.")
        result = validate_student_answer(
            topic=request.topic,
            practice_question=request.practice_question,
            correct_solution=request.correct_solution,
            student_answer=request.student_answer
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)