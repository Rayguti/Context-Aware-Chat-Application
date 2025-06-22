from pydantic import BaseModel
from typing import Optional

"""Simple schema for Server-Sent Events (SSE) """
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
