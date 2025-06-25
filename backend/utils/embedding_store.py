from openai import OpenAI
from core.config import OPENAI_API_KEY
from utils.context import pdf_chunks
import numpy as np


# Crear el cliente OpenAI
client = OpenAI(api_key=OPENAI_API_KEY)
# openai.api_key = OPENAI_API_KEY

# We storage the embeddings as a dictionary list {chunk:str, embedding: list[float]}
embedding_store = []

def generate_embeddings():
    global embedding_store
    embedding_store = []
    for chunk in pdf_chunks:
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=chunk
        )
        embedding = response.data[0].embedding
        embedding_store.append({
            "chunk": chunk,
            "embedding": embedding
        })
    print(f"Embeddings generated for {len(embedding_store)} chunks.")

def cosine_similarity(vec1: list[float], vec2: list[float]) -> float:
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

def search_similar_chunks(question: str, top_k: int = 3) -> list[str]:
    # Generarate the embedding for the question
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=question
    )
    question_embedding = response.data[0].embedding

    # Calculate the similarity between the question embedding and each chunk's embedding
    similarities = []
    for item in embedding_store:
        sim = cosine_similarity(question_embedding, item['embedding'])
        similarities.append((sim, item['chunk']))

    # sort the similarities in descending order
    similarities.sort(key=lambda x: x[0], reverse=True)

    return [chunk for _, chunk in similarities[:top_k]]