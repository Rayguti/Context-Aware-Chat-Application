import openai

from core.config import OPENAI_API_KEY

openai.api_key = OPENAI_API_KEY

def build_prompt(user_message: str, pdf_context: str) -> str:
    ###this is use to process the PDF in parts, so it doesn't exceed the token limit
    trimmed_context = pdf_context [:6000]

    return f"Document:\n{trimmed_context}\n\nUser Question: {user_message}\nAnswer:"

async def ask_openai(message: str, pdf_context: str):
    prompt = build_prompt(message, pdf_context)
    response = await openai.ChatCompletion.acreate(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that answers based on a document."},
            {"role": "user", "content": prompt}
        ],
        stream=True
    )
    #use to avoid sending the same content multiple times
    last_sent = ""

    async for chunk in response:
        content = chunk["choices"][0].get("delta", {}).get("content")
        if content and content != last_sent:
            last_sent = content
            yield content
