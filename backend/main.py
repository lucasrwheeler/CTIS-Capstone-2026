from fastapi import FastAPI
from api.requirements_api import router as requirements_router
from api.eligibility_api import router as eligibility_router
from api.prerequisites_api import router as prerequisites_router

app = FastAPI(
    title="Guilford Academic Planner API",
    version="1.0"
)

app.include_router(requirements_router)
app.include_router(eligibility_router)
app.include_router(prerequisites_router)

@app.get("/")
def root():
    return {"message": "Academic Planner API is running"}