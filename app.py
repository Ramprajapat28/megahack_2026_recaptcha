from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from question_generator import generate_questions  # We will create this next

app = FastAPI(title="AI Question Generator API")

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

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Question Generator API. Use POST /api/generate-questions to generate questions"}

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)