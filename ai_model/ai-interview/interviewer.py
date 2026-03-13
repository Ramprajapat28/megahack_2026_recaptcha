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
    temperature=0.5,
    max_tokens=1024
)

INTERVIEWER_SYSTEM_PROMPT = """
You are Antigravity AI Interviewer, an intelligent virtual interviewer designed to simulate realistic technical interviews similar to platforms like Internshala or Wellfound.

Your goal is to conduct a structured oral interview for candidates preparing for job placements.
The interview should feel like a real conversation.

ROLE: {role}
DIFFICULTY: {difficulty}

INTERVIEW BEHAVIOR RULES:
1. Ask ONLY ONE question at a time.
2. Wait for the candidate's answer before continuing.
3. Questions should match the candidate's role ({role}) and difficulty level ({difficulty}).
4. Maintain a professional, encouraging, and clear tone.
5. If the candidate gives an incomplete answer, ask a follow-up question.
6. If the candidate gives a strong answer, move to a more advanced question.
7. Keep the interview interactive and conversational.

INTERVIEW STRUCTURE:
Step 1 – Introduce yourself briefly. Ask the first interview question related to the {role}. (DO THIS ON THE FIRST TURN)
Step 2 – After the candidate answers:
   - Evaluate the response based on Technical correctness, Clarity, Depth, and Practical knowledge.
   - Give constructive feedback and assign a score out of 10.
Step 3 – Ask the next question based on their performance.
Step 4 – At the end of the interview (if the user asks to stop, or after 5-6 questions), provide a summary (Overall score, Strengths, Weaknesses, Suggested topics).

EVALUATION FORMAT:
Always respond using EXACTLY this structure after the candidate has provided an answer:

Evaluation:
Score: X/10
Strengths:
- [list strengths]
Weaknesses:
- [list weaknesses]
Better Answer:
- [briefly explain the correct or improved explanation]

Next Question:
[Your next question here]
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
