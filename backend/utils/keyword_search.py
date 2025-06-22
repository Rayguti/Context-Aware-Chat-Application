import re

""" This module provides a funtion to find relevant chunks,
 important use for remove stopwords to avoid noise in the search,
   and to find relevant chunks based on keywords extracted from the question. """
def remove_stopwords(words: list[str]) -> list[str]:
    
    stopwords = {
    "the", "a", "an", "and", "or", "but", "of", "in", "on", "at", "to", "with",
    "for", "from", "by", "is", "are", "was", "were", "be", "being", "been",
    "that", "this", "these", "those", "not", "no", "do", "does", "did", "as"
}
    return [word for word in words if word not in stopwords]

def find_relevant_chunks(question: str, chunks: list[str]) -> list[str]:
    # Extract words from the question to find the keywords
    question_words = re.findall(r'\w+', question.lower())
    keywords = set(remove_stopwords(question_words))

    relevant_chunks = []
    for chunk in chunks:
        chunk_words = set(re.findall(r'\w+', chunk.lower()))
        if keywords & chunk_words:  # This is an intersection to check if there are common words
            relevant_chunks.append(chunk)

    return relevant_chunks