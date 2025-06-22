import json
import uuid
from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
from models.schemas import ChatRequest
from services.chat_service import ask_openai
from utils.context import pdf_text

# In-memory store for conversations
conversation_history = {}

router = APIRouter()

@router.post("/chat")
async def chat_endpoint(req: ChatRequest):

    # Initialize conversation if not exists
    if req.conversation_id not in conversation_history:
        conversation_history[req.conversation_id] = []
    # Append user message to conversation history
    conversation_history[req.conversation_id].append({"role": "user", "content": req.message})

    print(f"Received request for conversation ID: {req.conversation_id}")

    async def event_generator():
        try:
            collected_ai = ""
            async for chunk in ask_openai(req.message, pdf_text):
                collected_ai += chunk
                yield json.dumps({'type': 'content', 'content': chunk})
            yield json.dumps({'type': 'done'})

            # Append full AI response after streaming ends
            conversation_history[req.conversation_id].append({"role": "assistant", "content": collected_ai})

        except Exception as e:
            yield json.dumps({'type': 'error', 'content': str(e)})

    return EventSourceResponse(event_generator())


@router.get("/conversation/{conv_id}")
def get_conversation(conv_id: str):
    return conversation_history.get(conv_id, [])

@router.get("/conversations")
def get_conversation():
    return conversation_history