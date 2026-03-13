import os
import json
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Load environment variables
load_dotenv()

# Setup Groq LLM
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable not set in .env")

# Initialize ChatGroq
chat_model = ChatGroq(
    temperature=0.2,
    model="llama-3.1-8b-instant",  # Updated to a valid supported model
    api_key=GROQ_API_KEY,
    max_tokens=4000
)

def generate_questions(topic: str, difficulty: str, job_description: str, num_questions: int = 5) -> dict:
    """
    Generates multiple-choice exam questions based on Topic, Difficulty, and Job Description.
    Returns a dictionary parsed from the LLM's JSON output.
    """
    
    system_prompt = (
        "You are an expert technical interviewer and exam creator. "
        "Your goal is to create high-quality, practical multiple-choice questions (MCQs) for candidate assessment. "
        "Always respond with pure, valid JSON ONLY. Do NOT wrap the JSON in markdown blocks like ```json."
    )
    
    user_prompt = """
    Generate {num_questions} multiple-choice test questions tailored for the following constraints:
    - Topic: {topic}
    - Difficulty: {difficulty}
    - Target Job Description/Role: {job_description}

    Requirements:
    1. Questions must test relevant skills needed for the specified Job Description.
    2. Difficulty must accurately reflect the requested level (e.g., Easy = fundamentals, Hard = edge cases/complex scenarios).
    3. Include exactly 4 options per question (A, B, C, D).
    4. Provide the correct answer and a brief explanation why it's correct.

    Return ONLY this exact JSON structure:
    {{
      "metadata": {{
        "topic": "{topic}",
        "difficulty": "{difficulty}",
        "job_description": "{job_description}",
        "total_questions": {num_questions}
      }},
      "questions": [
        {{
          "id": 1,
          "question": "Question text here",
          "options": {{
            "A": "Option A text",
            "B": "Option B text",
            "C": "Option C text",
            "D": "Option D text"
          }},
          "correct_answer": "A",
          "explanation": "Brief explanation."
        }}
      ]
    }}
    """
    
    prompt_template = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", user_prompt)
    ])
    
    # Create the chain
    chain = prompt_template | chat_model | StrOutputParser()
    
    try:
        # Invoke the chain
        response_text = chain.invoke({
            "topic": topic,
            "difficulty": difficulty,
            "job_description": job_description,
            "num_questions": num_questions
        })
        
        # Clean up potential markdown formatting from the response
        cleaned_response = response_text.strip()
        if cleaned_response.startswith('```json'):
            cleaned_response = cleaned_response[7:]
        if cleaned_response.startswith('```'):
            cleaned_response = cleaned_response[3:]
        if cleaned_response.endswith('```'):
            cleaned_response = cleaned_response[:-3]
            
        cleaned_response = cleaned_response.strip()
        
        # Parse the JSON string to a Python dictionary
        result_json = json.loads(cleaned_response)
        return result_json
        
    except json.JSONDecodeError as json_err:
        print(f"Failed to parse JSON. Raw response was:\n{response_text}")
        raise ValueError(f"LLM did not return valid JSON. Error: {str(json_err)}")
    except Exception as e:
        print(f"Error calling LLM: {str(e)}")
        raise e