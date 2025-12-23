from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from datetime import datetime
import httpx
import os
import json

load_dotenv()

app = FastAPI(title="LED Manufacturing AI Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Query(BaseModel):
    question: str

class QueryResponse(BaseModel):
    response: str
    timestamp: str


query_history = []


@app.post("/api/query", response_model=QueryResponse)
async def process_query(query: Query):
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY not configured"
        )

    system_prompt = """
    You are an expert AI assistant specializing in LED light manufacturing.
    Focus on real-world manufacturing processes, failure analysis, and optimization.
    Provide practical, technical, industry-level answers.Answer user query in precisely and concisely.
    """

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {groq_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama-3.1-8b-instant",  
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": query.question},
                    ],
                    "temperature": 0.7,
                    "max_tokens": 1024,
                },
            )

            response.raise_for_status()
            data = response.json()

            ai_response = data["choices"][0]["message"]["content"]
            timestamp = datetime.utcnow().isoformat()

            query_history.append({
                "question": query.question,
                "response": ai_response,
                "timestamp": timestamp,
            })

            if len(query_history) > 100:
                query_history.pop(0)

            return QueryResponse(
                response=ai_response,
                timestamp=timestamp
            )

        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Groq API error: {str(e)}",
            )


@app.get("/api/history")
async def get_history(limit: int = 10):
    """Get query history"""
    return {"history": query_history[-limit:]}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)