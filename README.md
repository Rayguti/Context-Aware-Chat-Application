# Setup Instructions

- ### Backend

  - cd backend
  - pip install -r requirements.txt
  - uvicorn main:app --reload

- ### Frontend

  - cd frontend
  - npm install
  - npm start

## .env

Please, review the env.example in both apps to check the notes, the most important one is to add the OpenAI Api key to the backend.

# Documentation

## Design decisions

In both apps, the structure of the project is think it to be modular, scalable, and looking for clean code

## Challenges faced and solutions

- how to reduce the tokens
- responsive design

## Posible Improvements

- database
- vectors and tokens reduction
- logins and users
- messages format

## Project Structure

In both apps, the structure of the project is think it to be modular, maintainability

backend/
├── main.py
├── core/
│ └── config.py
├── routers/
│ ├── chat.py
│ └── health.py
├── services/
│ ├── chat_service.py
│ └── pdf_loader.py
├── models/
│ └── schemas.py
├── utils/
│ └── logger.py
├── tests/
│ └── test_chat.py
├── .env.example
├── requirements.txt

- ### Backend

- ### Frontend

## Use examples and pictures

how to run backend

cd backend
pip install -r requirements.txt
uvicorn main:app --reload
