import json
from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
from models.schemas import ChatRequest
from services.chat_service import ask_openai

# In-memory store for conversations, this is used in this way, because we are not using a database
conversation_history = {}

router = APIRouter()

@router.post("/chat")
async def chat_endpoint(req: ChatRequest):

    # Initialize conversation if not exists
    if req.conversation_id not in conversation_history:
        conversation_history[req.conversation_id] = []
    # Append user message to conversation history
    conversation_history[req.conversation_id].append({"role": "user", "content": req.message})

    async def event_generator():
        try:
            collected_ai = ""
            async for chunk in ask_openai(req.message):
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
    if conv_id not in conversation_history:
        return {"message": "Conversation not found"}, 404
    return conversation_history.get(conv_id, [])

## To clear the chat history of a conversation, we can use this endpoint
@router.delete("/conversation/{conv_id}")
def delete_conversation(conv_id: str):
    if conv_id not in conversation_history:
        return {"message": "Conversation not found"}, 404
    del conversation_history[conv_id]
    return {"message": "Conversation deleted successfully"}
        

## This endpoint just returns the first message of each conversation, to save space and use like the title of the conversation (similar to a chat app)
@router.get("/conversations")
def get_conversation():
    return {
        conv_id: [messages[0]] if messages else []
        for conv_id, messages in conversation_history.items()
    }
