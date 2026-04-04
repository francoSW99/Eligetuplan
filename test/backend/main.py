import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Eligetuplan API",
    description="Backend API for comparing Isapres health plans in Chile",
    version="1.0.0"
)

# CORS Configuration - restrict to frontend in production
origins = [
    "http://localhost:3000",
    "https://landingpage-asesoriasalud.vercel.app",  # Reference integration
    # "https://<your-vercel-frontend-domain>.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase Initialization
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://xyzcompany.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "public-anon-key")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"Warning: Supabase client initialization failed. {e}")
    supabase = None

# Pydantic models for request bodies
class MatchPlanRequest(BaseModel):
    age: int
    income_clp: int
    dependents: int
    preferred_region: str = None

class PlanResponse(BaseModel):
    id: str
    name: str
    isapre_name: str
    logo_url: str
    price_uf: float
    match_score: float

@app.get("/")
def read_root():
    return {"message": "Welcome to the Eligetuplan API"}

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/v1/match-plan", response_model=list[PlanResponse])
def match_plan(payload: MatchPlanRequest):
    """
    Core Algorithm Endpoint:
    Receives user JSON payload (age, income, dependents)
    Calculates a mathematical score to return the Top 3 Isapre plans.
    """
    if not supabase:
        # Return mock data if Supabase isn't configured yet
        return [
            PlanResponse(
                id="mock-1",
                name="Plan Preferente A",
                isapre_name="Isapre Ejemplo 1",
                logo_url="https://via.placeholder.com/150",
                price_uf=3.5,
                match_score=95.5
            ),
            PlanResponse(
                id="mock-2",
                name="Plan Libre Elección B",
                isapre_name="Isapre Ejemplo 2",
                logo_url="https://via.placeholder.com/150",
                price_uf=4.2,
                match_score=88.0
            )
        ]
        
    # TODO: Fetch plans from Supabase and implement matching algorithm
    # data = supabase.table("planes").select("*, isapres(*)").execute()
    # return process_plans(data, payload)
    
    raise HTTPException(status_code=501, detail="Not Implemented Yet")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
