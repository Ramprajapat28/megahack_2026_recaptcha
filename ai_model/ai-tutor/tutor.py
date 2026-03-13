import os
import json
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
# SYSTEM PROMPTS
# =========================================================

TUTOR_SYSTEM_PROMPT = """
You are a friendly AI Tutor. Explain concepts in the simplest, clearest way possible — like a mentor talking to a student.
Always use plain language. Avoid jargon. Use relatable real-world examples.
Return pure valid JSON only. Do NOT wrap in markdown blocks.
"""

USER_PROMPT = """
The student wants to learn about: {query}

Explain it simply in 2-3 sentences. Then give one short, relatable real-world example.

Return ONLY this JSON:
{{
  "topic": "{query}",
  "explanation": "A simple, conversational explanation in 2-3 sentences. No bullet points.",
  "example": "One clear, relatable real-world example that makes the concept click."
}}
"""

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
# FEATURE 1: Teach a concept (text or voice input)
# =========================================================

def teach_concept(query: str) -> dict:
    """
    Takes a student's question/topic and returns a structured teaching response.
    Also includes related_topics for the student to explore next.
    """
    prompt_template = ChatPromptTemplate.from_messages([
        ("system", TUTOR_SYSTEM_PROMPT),
        ("human", USER_PROMPT)
    ])
    chain = prompt_template | chat_model | StrOutputParser()

    try:
        response_text = chain.invoke({"query": query})
        return _clean_json(response_text)
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
    """
    Handles follow-up questions from the student within the context of a topic.
    Uses chat history to maintain conversation context.
    
    chat_history format:
        [
          {"role": "human", "content": "What is Binary Search?"},
          {"role": "ai", "content": "Binary search is..."}
        ]
    """
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

    # Build message history for LangChain
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
    """
    Suggests related topics the student should study next after learning a topic.
    Provides a structured learning progression roadmap.
    """
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
    """
    Evaluates whether the student's answer to the practice question is correct.
    Provides constructive feedback and a score.
    """
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
