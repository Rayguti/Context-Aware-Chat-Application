
from core.config import PDF_PATH
from utils.pdf_loader import extract_text_from_pdf, split_text_into_chunks

"""Generates the context for the chat service by extracting text from a PDF file and splitting it into chunks."""
pdf_text = extract_text_from_pdf(PDF_PATH)
pdf_chunks = split_text_into_chunks(pdf_text, max_chunk_size=500)
