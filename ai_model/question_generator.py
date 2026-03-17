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
    model="llama-3.1-8b-instant",
    api_key=GROQ_API_KEY,
    max_tokens=4000
)

# Valid category enum values (matches the database schema)
VALID_CATEGORIES = [
    "quantitative aptitude",
    "logical reasoning",
    "verbal ability",
    "technical",
    "general knowledge"
]

def _validate_category(category: str) -> str:
    """Validates and normalises the category string against the enum."""
    normalised = category.strip().lower()
    if normalised not in VALID_CATEGORIES:
        raise ValueError(
            f"Invalid category '{category}'. Must be one of: {', '.join(VALID_CATEGORIES)}"
        )
    return normalised

def _clean_json(response_text: str) -> dict:
    """Strips markdown fences from LLM output and parses JSON."""
    cleaned = response_text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return json.loads(cleaned.strip())


def generate_questions(topic: str, difficulty: str, job_description: str,
                       category: str, num_questions: int = 5) -> dict:
    """
    Generates MCQs based on Topic, Difficulty, Job Description, and Category.
    """
    category = _validate_category(category)

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
    - Category: {category}

    The questions MUST belong to the "{category}" category. This means:
    - "quantitative aptitude": numerical problem-solving, arithmetic, percentages, ratios, etc.
    - "logical reasoning": patterns, series, puzzles, syllogisms, coding-decoding, etc.
    - "verbal ability": grammar, vocabulary, reading comprehension, sentence correction, etc.
    - "technical": role-specific programming, algorithms, system design, database etc.
    - "general knowledge": current affairs, science, history, geography etc.

    Requirements:
    1. Questions must test relevant skills for the specified Job Description AND match the category.
    2. Difficulty must accurately reflect the requested level.
    3. Include exactly 4 options per question (A, B, C, D).
    4. Provide the correct answer and a brief explanation.

    Return ONLY this exact JSON structure:
    {{
      "metadata": {{
        "topic": "{topic}",
        "difficulty": "{difficulty}",
        "job_description": "{job_description}",
        "category": "{category}",
        "total_questions": {num_questions}
      }},
      "questions": [
        {{
          "id": 1,
          "category": "{category}",
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

    chain = prompt_template | chat_model | StrOutputParser()

    try:
        response_text = chain.invoke({
            "topic": topic,
            "difficulty": difficulty,
            "job_description": job_description,
            "category": category,
            "num_questions": num_questions
        })
        return _clean_json(response_text)

    except json.JSONDecodeError as json_err:
        print(f"Failed to parse JSON. Raw response was:\n{response_text}")
        raise ValueError(f"LLM did not return valid JSON. Error: {str(json_err)}")
    except Exception as e:
        print(f"Error calling LLM: {str(e)}")
        raise e


def generate_jd_questions(role: str, skills: str, experience: str, difficulty: str,
                          category: str, num_questions: int = 5) -> dict:
    """
    Generates MCQs based on Role, Skills, Experience, and Category.
    """
    category = _validate_category(category)

    system_prompt = (
        "You are a technical recruiter designing screening questions. "
        "Always respond with pure, valid JSON ONLY. Do NOT wrap the JSON in markdown blocks like ```json."
    )

    user_prompt = """
    Based on the following job description constraints, generate {num_questions} multiple-choice questions that evaluate the candidate.

    Job Description constraints:
    - Role: {role}
    - Skills Details: {skills}
    - Experience Level: {experience}
    - Difficulty Level: {difficulty}
    - Category: {category}

    The questions MUST belong to the "{category}" category:
    - "quantitative aptitude": numerical problem-solving, arithmetic, percentages, ratios, etc.
    - "logical reasoning": patterns, series, puzzles, syllogisms, coding-decoding, etc.
    - "verbal ability": grammar, vocabulary, reading comprehension, sentence correction, etc.
    - "technical": role-specific programming, algorithms, system design, database etc.
    - "general knowledge": current affairs, science, history, geography etc.

    Return ONLY this exact JSON structure:
    {{
      "metadata": {{
        "role": "{role}",
        "skills": "{skills}",
        "experience": "{experience}",
        "difficulty": "{difficulty}",
        "category": "{category}",
        "total_questions": {num_questions}
      }},
      "questions": [
        {{
          "id": 1,
          "category": "{category}",
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

    chain = prompt_template | chat_model | StrOutputParser()

    try:
        response_text = chain.invoke({
            "role": role,
            "skills": skills,
            "experience": experience,
            "difficulty": difficulty,
            "category": category,
            "num_questions": num_questions
        })
        return _clean_json(response_text)

    except json.JSONDecodeError as json_err:
        raise ValueError(f"LLM did not return valid JSON. Error: {str(json_err)}")
    except Exception as e:
        raise e


def generate_company_questions(company: str, role: str, difficulty: str,
                               category: str, num_questions: int = 5) -> dict:
    """
    Generates company interview pattern MCQs filtered by Category.
    """
    category = _validate_category(category)

    system_prompt = (
        "You are an expert technical interviewer representing top-tier technology companies. "
        "Always respond with pure, valid JSON ONLY. Do NOT wrap the JSON in markdown blocks like ```json."
    )

    user_prompt = """
    Generate {num_questions} multiple-choice questions inspired by real interview trends for the following company and role.

    Constraints:
    - Company: {company}
    - Role: {role}
    - Difficulty: {difficulty}
    - Category: {category}

    The questions MUST belong to the "{category}" category:
    - "quantitative aptitude": numerical problem-solving, arithmetic, percentages, ratios, etc.
    - "logical reasoning": patterns, series, puzzles, syllogisms, coding-decoding, etc.
    - "verbal ability": grammar, vocabulary, reading comprehension, sentence correction, etc.
    - "technical": role-specific programming, algorithms, system design, database etc.
    - "general knowledge": current affairs, science, history, geography etc.

    The questions should also reflect the known interview patterns for this company (e.g. Amazon leadership principles, Google algorithms, TCS NQT patterns).

    Return ONLY this exact JSON structure:
    {{
      "metadata": {{
        "company": "{company}",
        "role": "{role}",
        "difficulty": "{difficulty}",
        "category": "{category}",
        "total_questions": {num_questions}
      }},
      "questions": [
        {{
          "id": 1,
          "category": "{category}",
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

    chain = prompt_template | chat_model | StrOutputParser()

    try:
        response_text = chain.invoke({
            "company": company,
            "role": role,
            "difficulty": difficulty,
            "category": category,
            "num_questions": num_questions
        })
        return _clean_json(response_text)

    except json.JSONDecodeError as json_err:
        raise ValueError(f"LLM did not return valid JSON. Error: {str(json_err)}")
    except Exception as e:
        raise e