from core.config import PDF_PATH
from services.pdf_loader import load_pdf

pdf_text = load_pdf(PDF_PATH)
