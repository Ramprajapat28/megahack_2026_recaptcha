import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage

# Load .env from the parent directory (ai_model/) regardless of where we're called from
_env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=_env_path)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError(
        "GROQ_API_KEY is not set. Please add it to your .env file in the ai_model folder."
    )

# Use llama-3.3-70b-versatile for fast, high-quality conversational logic (active Groq model)
llm = ChatGroq(
    model_name="llama-3.3-70b-versatile",
    groq_api_key=GROQ_API_KEY,
    temperature=0.75,   # Higher = more natural, varied language
    max_tokens=400      # Keep it concise — real interviewers are brief
)

INTERVIEWER_SYSTEM_PROMPT = """
You are Alex, a senior technical interviewer at a top technology company.
You are conducting a voice-based interview for a {role} position at {difficulty} level.

YOUR PERSONALITY & VOICE:
- You sound warm, confident, and professional — like a real human colleague
- You use natural spoken language: contractions ("that's", "let's", "I'd love to know"), short phrases, casual-but-smart tone
- You are encouraging, but honest — you push back gently when an answer is shallow
- You NEVER sound robotic, clinical, or like you're reading from a script

STRICT CONVERSATION RULES:
1. Ask ONLY ONE question per turn. One. Never compound questions.
2. After the candidate answers, ALWAYS react naturally first (1 sentence), THEN give brief feedback (1 sentence), THEN ask the next question.
3. React like a human: "Good point.", "Interesting, I hadn't thought of it that way.", "That's mostly right, but let me push back a little.", "Nice — you clearly know this area well."
4. Your feedback should be SHORT and CONVERSATIONAL — NOT a structured rubric. Never say "Score: 7/10" or "Strengths: / Weaknesses:".
5. Questions should be focused and direct — one clear sentence, no preamble.
6. Sound adaptive — if they nail the answer, jump to something harder. If they struggle, simplify or ask a follow-up.
7. After 5-6 questions, naturally wrap up: briefly tell them how they did overall (2-3 warm sentences), thank them, and close.

OPENING (first turn only):
Introduce yourself briefly in 1-2 sentences, then immediately ask the very first technical question. Keep it friendly and direct.
Example: "Hey, great to have you here! I'm Alex — I'll be taking you through today's session. Let's start with something foundational: can you walk me through how you'd approach [QUESTION]?"

EXAMPLE RESPONSE STYLE (after an answer):
"Yeah, that's a solid foundation — REST is essentially about stateless communication over HTTP. I'd push you a bit further though: what's the key difference between PUT and PATCH? Take your time."

ROLE: {role}
DIFFICULTY: {difficulty}
"""

def generate_interview_response(role: str, difficulty: str, chat_history: list, user_message: str):
    """
    Processes the next turn of the interview.
    
    Args:
        role (str): The job role being interviewed for (e.g., 'Backend Developer').
        difficulty (str): The difficulty level (e.g., 'Beginner', 'Advanced').
        chat_history (list): A list of dictionaries representing previous messages 
                             e.g., [{'role': 'human', 'content': '...'}, {'role': 'ai', 'content': '...'}]
        user_message (str): The latest transcript from the user.
        
    Returns:
        str: The AI interviewer's formatted response.
    """
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", INTERVIEWER_SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{user_message}")
    ])
    
    # Convert dictionary history to Langchain message objects
    langchain_history = []
    for msg in chat_history:
        if msg.get('role') == 'human':
            langchain_history.append(HumanMessage(content=msg.get('content')))
        elif msg.get('role') == 'ai':
            langchain_history.append(AIMessage(content=msg.get('content')))
            
    chain = prompt | llm
    
    response = chain.invoke({
        "role": role,
        "difficulty": difficulty,
        "history": langchain_history,
        "user_message": user_message
    })
    
    return response.content

def start_interview(role: str, difficulty: str):
    """
    Initiates the interview by introducing the AI and asking the first question.
    """
    prompt = ChatPromptTemplate.from_messages([
        ("system", INTERVIEWER_SYSTEM_PROMPT),
        ("human", "Hi, I am the candidate. Please start the interview by introducing yourself and asking the first question.")
    ])
    
    chain = prompt | llm
    
    response = chain.invoke({
        "role": role,
        "difficulty": difficulty,
        "history": [],
        "user_message": ""
    })
    
    return response.content
