import fitz  # PyMuPDF

"""This module provides functionality to extract text from PDF files and split the text into manageable chunks, this will help to reduce the token cost."""
def extract_text_from_pdf(pdf_path: str) -> str:
    doc = fitz.open(pdf_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text()
    doc.close()
    return full_text

def split_text_into_chunks(text: str, max_chunk_size: int = 500) -> list[str]:
    words = text.split()
    chunks = []
    for i in range(0, len(words), max_chunk_size):
        chunk = " ".join(words[i:i+max_chunk_size])
        chunks.append(chunk)
    return chunks