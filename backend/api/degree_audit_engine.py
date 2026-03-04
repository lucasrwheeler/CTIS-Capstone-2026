from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any

from degree_audit_engine import run_ctis_degree_audit

router = APIRouter()

class DegreeAuditRequest(BaseModel):
    completed: List[str]

@router.post("/degree-audit/ctis", response_model=Dict[str, Any])
def ctis_degree_audit(payload: DegreeAuditRequest):
    return run_ctis_degree_audit(payload.completed)