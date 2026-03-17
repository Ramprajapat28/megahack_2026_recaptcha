import os
import json
import re
from typing import List, Optional
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import HumanMessage, AIMessage

# Load env variables
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable not set in .env")

# Initialize ChatGroq
chat_model = ChatGroq(
    temperature=0.4,
    model="llama-3.1-8b-instant",
    api_key=GROQ_API_KEY,
    max_tokens=4000
)

# =========================================================
# UTILITY: Detect response depth from query phrasing
# =========================================================

SIMPLE_KEYWORDS = [
    "simply", "simple", "briefly", "quick", "short", "tldr",
    "tl;dr", "in short", "summarize", "summary", "one line",
    "what is", "define", "definition", "meaning of", "what does"
]

DETAILED_KEYWORDS = [
    "detail", "detailed", "explain in detail", "elaborate", "depth",
    "in depth", "deeply", "thoroughly", "step by step", "how does",
    "how to", "example", "with example", "demonstrate", "walk me through",
    "teach me", "learn", "understand", "implement", "code", "code example"
]

def _detect_depth(query: str) -> str:
    """
    Detects whether the student wants a simple or detailed response.
    Returns: 'simple' or 'detailed'
    """
    q_lower = query.lower()
    
    detail_score = sum(1 for kw in DETAILED_KEYWORDS if kw in q_lower)
    simple_score = sum(1 for kw in SIMPLE_KEYWORDS if kw in q_lower)

    # Default to detailed (more teaching value) if neither or tie
    if simple_score > detail_score:
        return "simple"
    return "detailed"


# =========================================================
# UTILITY: Clean LLM JSON output
# =========================================================

def _clean_json(raw: str) -> dict:
    cleaned = raw.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return json.loads(cleaned.strip())


# =========================================================
# PROMPTS
# =========================================================

SIMPLE_PROMPT = """
The student wants a SIMPLE & QUICK explanation of: {query}

Give a clear, concise explanation in 2-3 sentences max. No jargon.
Also give ONE short real-world analogy or example to help it click.

Return ONLY this JSON (pure JSON, no markdown):
{{
  "topic": "{query}",
  "depth": "simple",
  "explanation": "Clear 2-3 sentence explanation in plain language.",
  "example": "One short, relatable real-world analogy or example.",
  "key_point": "The single most important thing to remember about this topic."
}}
"""

DETAILED_PROMPT = """
The student wants a DETAILED explanation of: {query}

Teach this topic thoroughly, like a senior developer or professor would explain to a student.

Return ONLY this JSON (pure JSON, no markdown):
{{
  "topic": "{query}",
  "depth": "detailed",
  "explanation": "A comprehensive explanation covering what it is, why it matters, and when to use it. 4-6 sentences.",
  "how_it_works": "Step-by-step breakdown of how it works internally. Use numbered steps as a single string separated by \\n.",
  "example": "A detailed, realistic real-world example or scenario that shows the concept in action.",
  "code_example": "A short code snippet demonstrating the concept (if applicable, else empty string).",
  "common_mistakes": "The most common mistake beginners make with this topic.",
  "key_point": "The single most important takeaway about this topic."
}}
"""

SYSTEM_PROMPT = """
You are Antigravity AI Tutor — a friendly, expert teacher.
Explain concepts with precision and clarity, adapting your depth based on the instruction.
Always return pure valid JSON only. Never use markdown code blocks.
"""


# =========================================================
# FEATURE 1: Teach a concept (auto-detects depth)
# =========================================================

def teach_concept(query: str) -> dict:
    """
    Takes a student's question/topic and returns a structured teaching response.
    Automatically detects if the student wants a simple or detailed answer.
    """
    depth = _detect_depth(query)
    user_prompt = SIMPLE_PROMPT if depth == "simple" else DETAILED_PROMPT

    prompt_template = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("human", user_prompt)
    ])
    chain = prompt_template | chat_model | StrOutputParser()

    try:
        response_text = chain.invoke({"query": query})
        result = _clean_json(response_text)
        result["detected_depth"] = depth  # Pass depth to frontend for rendering
        return result
    except json.JSONDecodeError as e:
        raise ValueError(f"AI Tutor returned invalid JSON. Error: {str(e)}")
    except Exception as e:
        raise e


# =========================================================
# FEATURE 2: Multi-turn Chatbot / Follow-up Questions
# =========================================================

def answer_followup(
    topic: str,
    followup_question: str,
    chat_history: Optional[List[dict]] = None
) -> dict:
    system = f"""
You are Antigravity AI Tutor. A student is learning about: {topic}.
Answer follow-up questions clearly and simply in the tutor style.
Keep answers concise. Encourage and guide, not just answer.
Return ONLY valid JSON. Do NOT use markdown blocks.
"""

    followup_prompt = """
The student is asking a follow-up question: {followup_question}

Return ONLY this JSON:
{{
  "topic": "{topic}",
  "followup_question": "{followup_question}",
  "answer": "Clear, simple answer to the follow-up question.",
  "encouragement": "A short encouraging message to keep the student motivated.",
  "hint_for_next": "A hint or suggestion for what the student should explore next."
}}
"""

    messages = [("system", system)]
    if chat_history:
        for msg in chat_history:
            role = msg.get("role", "human")
            content = msg.get("content", "")
            messages.append((role, content))
    messages.append(("human", followup_prompt))

    prompt_template = ChatPromptTemplate.from_messages(messages)
    chain = prompt_template | chat_model | StrOutputParser()

    try:
        response_text = chain.invoke({
            "followup_question": followup_question,
            "topic": topic
        })
        return _clean_json(response_text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Follow-up answer returned invalid JSON. Error: {str(e)}")
    except Exception as e:
        raise e


# =========================================================
# FEATURE 3: Related Topics Suggestion
# =========================================================

def suggest_related_topics(topic: str, level: str = "beginner") -> dict:
    system = (
        "You are Antigravity AI Tutor. Your job is to create a learning path for students. "
        "Return only pure valid JSON. Do NOT use markdown blocks."
    )

    prompt = """
A student just finished learning about: {topic}
Their level: {level}

Suggest a learning progression plan.

Return ONLY this JSON:
{{
  "current_topic": "{topic}",
  "level": "{level}",
  "prerequisites_to_review": ["Prerequisite 1", "Prerequisite 2"],
  "next_topics": [
    {{
      "topic": "Next Topic Name",
      "reason": "Why they should study this next",
      "difficulty": "easy/medium/hard"
    }},
    {{
      "topic": "Next Topic Name 2",
      "reason": "Why they should study this next",
      "difficulty": "easy/medium/hard"
    }},
    {{
      "topic": "Next Topic Name 3",
      "reason": "Why they should study this next",
      "difficulty": "easy/medium/hard"
    }}
  ],
  "learning_tip": "A motivational tip tailored to this student's level."
}}
"""

    prompt_template = ChatPromptTemplate.from_messages([
        ("system", system),
        ("human", prompt)
    ])
    chain = prompt_template | chat_model | StrOutputParser()

    try:
        response_text = chain.invoke({"topic": topic, "level": level})
        return _clean_json(response_text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Related topics returned invalid JSON. Error: {str(e)}")
    except Exception as e:
        raise e


# =========================================================
# FEATURE 4: Validate Student's Practice Answer
# =========================================================

def validate_student_answer(
    topic: str,
    practice_question: str,
    correct_solution: str,
    student_answer: str
) -> dict:
    system = (
        "You are Antigravity AI Tutor. Evaluate a student's answer to a practice question. "
        "Be encouraging, give honest feedback, and award a score out of 10. "
        "Return only pure valid JSON. Do NOT use markdown blocks."
    )

    prompt = """
Topic: {topic}
Practice Question: {practice_question}
Correct Solution: {correct_solution}
Student's Answer: {student_answer}

Evaluate the student's answer and return ONLY this JSON:
{{
  "topic": "{topic}",
  "is_correct": true or false,
  "score": 8,
  "feedback": "Detailed, constructive feedback explaining what the student got right and what needs improvement.",
  "correct_solution_explained": "A brief re-explanation of the correct solution in simple terms.",
  "encouragement": "A short motivational message based on the student's performance."
}}
"""

    prompt_template = ChatPromptTemplate.from_messages([
        ("system", system),
        ("human", prompt)
    ])
    chain = prompt_template | chat_model | StrOutputParser()

    try:
        response_text = chain.invoke({
            "topic": topic,
            "practice_question": practice_question,
            "correct_solution": correct_solution,
            "student_answer": student_answer
        })
        return _clean_json(response_text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Answer validation returned invalid JSON. Error: {str(e)}")
    except Exception as e:
        raise e
