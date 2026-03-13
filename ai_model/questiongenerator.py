import os
import json
import time
import hashlib
import logging
import threading
import re
from typing import Dict, Optional, Tuple, List
from datetime import datetime

from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from fastapi.middleware.cors import CORSMiddleware
import httpx

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AI Question Generator API",
    description="Automatically generates exam questions based on Topic, Difficulty, and Job Description",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.getenv('API_KEY')
GROQ_API_KEY = os.getenv("GROQ_API_KEY", api_key)

httpx_client = httpx.Client()

def get_chat_model():
    if not GROQ_API_KEY:
         raise ValueError("GROQ_API_KEY not found in environment variables.")
    return ChatGroq(
        temperature=0.2,
        model="llama3-8b-8192",
        api_key=GROQ_API_KEY,
        max_tokens=4000,
        http_client=httpx_client
    )

class QuestionRequest(BaseModel):
    topic: str
    difficulty: str  # Easy, Medium, Hard, Expert
    job_description: str
    num_questions: int = 5

class AdvancedCache:
    def __init__(self, max_size=1000, ttl_seconds=3600):
        self.cache = {}
        self.access_times = {}
        self.creation_times = {}
        self.max_size = max_size
        self.ttl_seconds = ttl_seconds
        self.lock = threading.Lock()
    
    def get(self, key):
        with self.lock:
            if key in self.cache:
                if time.time() - self.creation_times[key] > self.ttl_seconds:
                    self._remove(key)
                    return None
                self.access_times[key] = time.time()
                return self.cache[key]
            return None
    
    def set(self, key, value):
        with self.lock:
            if len(self.cache) >= self.max_size:
                self._evict_lru()
            self.cache[key] = value
            self.access_times[key] = time.time()
            self.creation_times[key] = time.time()
    
    def _remove(self, key):
        if key in self.cache:
            del self.cache[key]
            del self.access_times[key]
            del self.creation_times[key]
    
    def _evict_lru(self):
        if not self.cache:
            return
        lru_key = min(self.access_times.keys(), key=lambda k: self.access_times[k])
        self._remove(lru_key)

class RateLimiter:
    def __init__(self, max_requests=100, window_seconds=3600):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = {}
        self.lock = threading.Lock()
    
    def is_allowed(self, identifier):
        with self.lock:
            now = time.time()
            if identifier not in self.requests:
                self.requests[identifier] = []
            
            # Clean old requests
            self.requests[identifier] = [
                req_time for req_time in self.requests[identifier]
                if now - req_time < self.window_seconds
            ]
            
            if len(self.requests[identifier]) < self.max_requests:
                self.requests[identifier].append(now)
                return True
            return False

# Initialize systems
cache = AdvancedCache(max_size=2000, ttl_seconds=7200)
rate_limiter = RateLimiter(max_requests=50, window_seconds=3600)

def generate_cache_key(topic: str, difficulty: str, num_questions: int, job_description: str) -> str:
    content = f"{topic.lower()}_{difficulty.lower()}_{num_questions}_{job_description.lower()}"
    return hashlib.md5(content.encode()).hexdigest()

def build_prompt_template() -> ChatPromptTemplate:
    base_system = (
        "You are an expert technical interviewer and educational content creator specializing in high-quality multiple-choice questions for specific job roles. "
        "Always respond with valid JSON only. Do not wrap in markdown or prefix/suffix text."
    )
    
    template = (
        "Generate {num_questions} practical and academically rigorous multiple-choice questions "
        "about \"{topic}\" at a \"{difficulty}\" level, tailored for a \"{job_description}\" role.\n\n"
        "Requirements:\n"
        "- Questions must test deep understanding relevant to the job description, not just memorization.\n"
        "- Include application, analysis, and synthesis level questions where possible.\n"
        "- Options should be plausible and challenging, avoiding obvious incorrect answers.\n"
        "- Include detailed explanations for correct answers.\n\n"
        "Difficulty Guidelines:\n"
        "- Easy: Basic concepts and definitions.\n"
        "- Medium: Application and analysis.\n"
        "- Hard: Synthesis, evaluation, and complex problem-solving.\n"
        "- Expert: Advanced theoretical concepts and real-world applications.\n\n"
        "Return ONLY this JSON structure:\n"
        "{{\n"
        "  \"metadata\": {{\n"
        "    \"topic\": \"{topic}\",\n"
        "    \"difficulty\": \"{difficulty}\",\n"
        "    \"job_description\": \"{job_description}\",\n"
        "    \"total_questions\": {num_questions},\n"
        "    \"generation_time\": \"{timestamp}\",\n"
        "    \"bloom_taxonomy_levels\": [\"remember\", \"understand\", \"apply\", \"analyze\", \"evaluate\", \"create\"]\n"
        "  }},\n"
        "  \"questions\": [\n"
        "    {{\n"
        "      \"id\": 1,\n"
        "      \"question\": \"Clear, specific question text\",\n"
        "      \"options\": {{\n"
        "        \"A\": \"First option\",\n"
        "        \"B\": \"Second option\", \n"
        "        \"C\": \"Third option\",\n"
        "        \"D\": \"Fourth option\"\n"
        "      }},\n"
        "      \"correct_answer\": \"A\",\n"
        "      \"explanation\": \"Detailed explanation of why this answer is correct\",\n"
        "      \"bloom_level\": \"analyze\",\n"
        "      \"estimated_time_seconds\": 45,\n"
        "      \"tags\": [\"concept1\", \"concept2\"]\n"
        "    }}\n"
        "  ]\n"
        "}}"
    )
    
    return ChatPromptTemplate.from_messages([
        ("system", base_system),
        ("human", template)
    ])

def validate_generated_content(content: str) -> Tuple[bool, Optional[Dict]]:
    try:
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if not json_match:
            return False, None
        
        json_data = json.loads(json_match.group())
        
        required_fields = ["metadata", "questions"]
        if not all(field in json_data for field in required_fields):
            return False, None
        
        questions = json_data.get("questions", [])
        if not questions:
            return False, None
        
        for i, q in enumerate(questions):
            required_q_fields = ["question", "options", "correct_answer"]
            if not all(field in q for field in required_q_fields):
                logger.warning(f"Question {i+1} missing required fields")
                return False, None
            
            options = q.get("options", {})
            if len(options) != 4 or not all(key in options for key in ["A", "B", "C", "D"]):
                logger.warning(f"Question {i+1} has invalid options structure")
                return False, None
            
            if q.get("correct_answer") not in ["A", "B", "C", "D"]:
                logger.warning(f"Question {i+1} has invalid correct answer")
                return False, None
        
        return True, json_data
    
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {e}")
        return False, None
    except Exception as e:
        logger.error(f"Content validation error: {e}")
        return False, None

def calculate_difficulty_score(difficulty: str) -> float:
    scores = {"easy": 0.25, "medium": 0.5, "hard": 0.75, "expert": 1.0}
    return scores.get(difficulty.lower(), 0.5)

def enhance_response(json_data: Dict) -> Dict:
    questions = json_data.get("questions", [])
    total_time = sum(q.get("estimated_time_seconds", 60) for q in questions)
    bloom_levels = [q.get("bloom_level", "remember") for q in questions]
    bloom_distribution = {level: bloom_levels.count(level) for level in set(bloom_levels)}
    
    analytics = {
        "total_estimated_time_minutes": round(total_time / 60, 1),
        "average_time_per_question": round((total_time / len(questions)) if questions else 0, 1),
        "bloom_taxonomy_distribution": bloom_distribution,
        "difficulty_score": calculate_difficulty_score(json_data.get("metadata", {}).get("difficulty", "medium")),
        "quality_indicators": {
            "has_explanations": all("explanation" in q for q in questions),
            "has_bloom_levels": all("bloom_level" in q for q in questions),
            "has_tags": all("tags" in q for q in questions)
        }
    }
    json_data["analytics"] = analytics
    return json_data

@app.post("/generate-questions")
def generate_questions(request: Request, body: QuestionRequest):
    try:
        topic = body.topic.strip()
        difficulty = body.difficulty.lower()
        num_questions = body.num_questions
        job_description = body.job_description.strip()
        
        if len(topic) < 2:
            raise HTTPException(status_code=400, detail="Topic must be at least 2 characters long")
            
        valid_difficulties = ["easy", "medium", "hard", "expert"]
        if difficulty not in valid_difficulties:
            raise HTTPException(status_code=400, detail=f"Difficulty must be one of: {', '.join(valid_difficulties)}")
            
        if num_questions < 1 or num_questions > 50:
            raise HTTPException(status_code=400, detail="Number of questions must be between 1 and 50")

        client_ip = request.client.host if request.client else "127.0.0.1"
        if not rate_limiter.is_allowed(client_ip):
            raise HTTPException(status_code=429, detail="Rate limit exceeded")

        cache_key = generate_cache_key(topic, difficulty, num_questions, job_description)
        cached_result = cache.get(cache_key)
        if cached_result:
            logger.info(f"Cache hit for topic: {topic}")
            return {**cached_result, "cached": True, "status": "success"}

        chat_model = get_chat_model()
        prompt_template = build_prompt_template()
        timestamp = datetime.now().isoformat()

        chain = (
            RunnablePassthrough.assign(timestamp=lambda _: timestamp)
            | prompt_template
            | chat_model
            | StrOutputParser()
        )

        max_retries = 3
        last_error = None

        for attempt in range(max_retries):
            try:
                logger.info(f"Generating MCQs (attempt {attempt + 1}) - Topic: {topic}, Job: {job_description}")
                
                response = chain.invoke({
                    "topic": topic,
                    "difficulty": difficulty,
                    "num_questions": num_questions,
                    "job_description": job_description,
                    "timestamp": timestamp
                })

                is_valid_content, json_data = validate_generated_content(response)
                
                if (is_valid_content and json_data):
                    enhanced_data = enhance_response(json_data)
                    cache.set(cache_key, enhanced_data)
                    logger.info(f"Successfully generated {len(enhanced_data.get('questions', []))} questions for topic: {topic}")
                    return {**enhanced_data, "cached": False, "status": "success"}
                    
                logger.warning(f"Invalid content generated on attempt {attempt + 1}")
                last_error = "Generated content validation failed"
            except Exception as e:
                last_error = str(e)
                logger.error(f"Generation attempt {attempt + 1} failed: {last_error}")
                if attempt == max_retries - 1:
                    break
                time.sleep(1)

        raise HTTPException(
            status_code=500, 
            detail=f"Unable to generate valid questions after {max_retries} attempts. Last error: {last_error}"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected error occurred")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "cache_size": len(cache.cache)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("questiongenerator:app", host="0.0.0.0", port=8000, reload=True)
