from openai import AsyncOpenAI
from utils.embedding_store import search_similar_chunks
from core.config import OPENAI_API_KEY
import tiktoken

client = AsyncOpenAI(api_key=OPENAI_API_KEY)

"""This module contains the logic to interact with OpenAI's API, uses chuncks to reduce token costs """
def build_prompt(user_message: str, relevant_chunks: list[str]) -> str:

    context = "\n\n---\n\n".join(relevant_chunks)

    return f"Document:\n{context}\n\nUser Question: {user_message}\nAnswer:"

async def ask_openai(message: str):
    relevant_chunks = search_similar_chunks(message, top_k=3) 

    prompt = build_prompt(message, relevant_chunks)
    print("🧮 Estimated tokens:", count_tokens(prompt))

    stream = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that answers based on a document."},
            {"role": "user", "content": prompt}
        ],
        stream=True
    )
    #this is used to avoid sending the same content multiple times

    last_sent = ""
    async for chunk in stream:
        content = chunk.choices[0].delta.content
        if content and content != last_sent:
            last_sent = content
            yield content

def count_tokens(text: str, model: str = "gpt-4o") -> int:
    enc = tiktoken.encoding_for_model(model)
    return len(enc.encode(text))