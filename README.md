Backend Acquitecture: in this case I didn 't divade it to make more easy to read it
backend/
├── main.py # Carga app y routers
├── core/
│ └── config.py # Carga de env vars
├── routers/
│ ├── chat.py # /chat endpoint
│ └── health.py # /health endpoint
├── services/
│ ├── chat_service.py # Lógica de OpenAI
│ └── pdf_loader.py # Cargar PDF
├── models/
│ └── schemas.py # Pydantic models
├── utils/
│ └── logger.py # Config de logging
├── tests/
│ └── test_chat.py # Test de /chat
├── .env.example
├── requirements.txt

explain prettier use

how to run backend

cd backend
pip install -r requirements.txt
uvicorn main:app --reload
