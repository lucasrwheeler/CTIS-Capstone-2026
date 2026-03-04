from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any

from backend.services.major_minor_engine.degree_audit_engine import (
    run_ctis_degree_audit,
    run_cns_degree_audit
)

router = APIRouter()

class DegreeAuditRequest(BaseModel):
    completed: List[str]

@router.post("/degree-audit/ctis", response_model=Dict[str, Any])
def ctis_degree_audit(payload: DegreeAuditRequest):
    return run_ctis_degree_audit(payload.completed)

@router.post("/degree-audit/cns", response_model=Dict[str, Any])
def cns_degree_audit(payload: DegreeAuditRequest):
    return run_cns_degree_audit(payload.completed)

@router.post("/degree-audit/ctis-minor", response_model=Dict[str, Any])
def ctis_minor_degree_audit(payload: DegreeAuditRequest):
    return run_ctis_minor_degree_audit(payload.completed)

@router.post("/degree-audit/cns-minor", response_model=Dict[str, Any])
def cns_minor_degree_audit(payload: DegreeAuditRequest):
    return run_cns_minor_degree_audit(payload.completed)