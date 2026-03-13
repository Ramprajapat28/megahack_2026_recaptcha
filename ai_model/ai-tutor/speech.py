"""
speech.py - Shared Speech Utility Module
=========================================
This module handles speech-to-text input integration for the AI Tutor
and AI Interview features.

Architecture:
- Speech-to-Text (STT): Uses the browser-native Web Speech API (SpeechRecognition)
  via a JavaScript snippet. This is free, fast, and requires no API key.
  The transcript is sent to the backend via a standard POST request.

- Text-to-Speech (TTS): Uses the browser-native Web Speech API (SpeechSynthesis)
  also via JavaScript on the frontend.

This file provides:
1. `get_speech_js()` - Returns the JavaScript snippet for speech functionality.
   Usable in both AI Tutor and AI Interview pages.
2. `SpeechTranscript` - A Pydantic model representing a speech transcript payload.
3. Helper utils if needed in future features.

Usage in FastAPI (ai-tutor, ai-interview, etc.):
    from ai-tutor.speech import SpeechTranscript, get_speech_js
"""

from pydantic import BaseModel
from typing import Optional


class SpeechTranscript(BaseModel):
    """
    Pydantic model representing the payload sent from browser speech recognition
    to any backend endpoint.
    Fields:
        transcript (str): The text transcribed from speech.
        language (str): Optional BCP 47 language tag (default: 'en-US').
    """
    transcript: str
    language: Optional[str] = "en-US"


def get_speech_js(
    input_element_id: str = "speechInput",
    button_element_id: str = "micButton",
    status_element_id: str = "speechStatus"
) -> str:
    """
    Returns the JavaScript snippet for Web Speech API integration.
    This JS snippet can be embedded in any HTML page for both:
    - AI Tutor (text query from voice)
    - AI Interview (voice-based answer capture)

    Parameters:
        input_element_id: The ID of the input/textarea that receives the transcript.
        button_element_id: The ID of the mic button to toggle listening.
        status_element_id: The ID of the element to show listening status.

    Returns:
        str: JavaScript code as a string.
    """
    return f"""
<script>
// =============================================
// Web Speech API - Shared Speech Module
// Compatible with: AI Tutor, AI Interview
// =============================================
(function() {{
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {{
        console.warn("Web Speech API is not supported in this browser. Please use Chrome or Edge.");
        const statusEl = document.getElementById('{status_element_id}');
        if (statusEl) statusEl.textContent = "⚠️ Speech not supported. Please type your query.";
        const micBtn = document.getElementById('{button_element_id}');
        if (micBtn) micBtn.disabled = true;
        return;
    }}

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let isListening = false;

    const micButton = document.getElementById('{button_element_id}');
    const inputEl = document.getElementById('{input_element_id}');
    const statusEl = document.getElementById('{status_element_id}');

    if (micButton) {{
        micButton.addEventListener('click', () => {{
            if (isListening) {{
                recognition.stop();
            }} else {{
                recognition.start();
            }}
        }});
    }}

    recognition.onstart = () => {{
        isListening = true;
        if (micButton) micButton.classList.add('listening');
        if (statusEl) statusEl.textContent = '🎙️ Listening...';
    }};

    recognition.onresult = (event) => {{
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {{
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {{
                finalTranscript += transcript;
            }} else {{
                interimTranscript += transcript;
            }}
        }}

        if (inputEl) {{
            inputEl.value = finalTranscript || interimTranscript;
        }}
    }};

    recognition.onend = () => {{
        isListening = false;
        if (micButton) micButton.classList.remove('listening');
        if (statusEl) statusEl.textContent = ''; 
    }};

    recognition.onerror = (event) => {{
        isListening = false;
        if (micButton) micButton.classList.remove('listening');
        if (statusEl) statusEl.textContent = `❌ Error: ${{event.error}}`;
        console.error("Speech recognition error:", event.error);
    }};

    // Text-to-speech utility (reusable from AI Interview or Tutor feedback)
    window.speakText = function(text, rate = 1.0, pitch = 1.0) {{
        if ('speechSynthesis' in window) {{
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = rate;
            utterance.pitch = pitch;
            window.speechSynthesis.cancel(); // Stop any current speech
            window.speechSynthesis.speak(utterance);
        }}
    }};

    window.stopSpeaking = function() {{
        if ('speechSynthesis' in window) {{
            window.speechSynthesis.cancel();
        }}
    }};
}})();
</script>
"""


def get_speech_css() -> str:
    """
    Returns CSS for mic button animation states.
    Reusable for both AI Tutor and AI Interview frontend.
    """
    return """
<style>
#micButton {
    background: #6c47ff;
    color: white;
    border: none;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

#micButton.listening {
    background: #ef4444;
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
    animation: pulse 1.2s infinite;
}

@keyframes pulse {
    0%   { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
    70%  { box-shadow: 0 0 0 12px rgba(239, 68, 68, 0); }
    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

#speechStatus {
    font-size: 13px;
    color: #a78bfa;
    margin-top: 4px;
    min-height: 20px;
}
</style>
"""
