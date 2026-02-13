from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.requirements_api import router as requirements_router
from backend.api.eligibility_api import router as eligibility_router
from backend.api.prerequisites_api import router as prerequisites_router

app = FastAPI(
    title="Guilford Academic Planner API",
    version="1.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(requirements_router)
app.include_router(eligibility_router)
app.include_router(prerequisites_router)

@app.get("/")
def root():
    return {"message": "Academic Planner API is running"}