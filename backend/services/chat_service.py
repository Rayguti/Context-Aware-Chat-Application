import openai
from utils.keyword_search import find_relevant_chunks
from core.config import OPENAI_API_KEY

openai.api_key = OPENAI_API_KEY

"""This module contains the logic to interact with OpenAI's API, uses chuncks to reduce token costs """
def build_prompt(user_message: str, relevant_chunks: list[str]) -> str:

    context = "\n\n---\n\n".join(relevant_chunks)

    return f"Document:\n{context}\n\nUser Question: {user_message}\nAnswer:"

async def ask_openai(message: str, all_chunks: list[str]):
    relevant_chunks = find_relevant_chunks(message, all_chunks)

    prompt = build_prompt(message, relevant_chunks)
    response = await openai.ChatCompletion.acreate(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that answers based on a document."},
            {"role": "user", "content": prompt}
        ],
        stream=True
    )
    #this is used to avoid sending the same content multiple times
    last_sent = ""

    async for chunk in response:
        content = chunk["choices"][0].get("delta", {}).get("content")
        if content and content != last_sent:
            last_sent = content
            yield content
