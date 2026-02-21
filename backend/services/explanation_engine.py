# backend/services/explanation_engine.py

from typing import Dict, List


def explain_missing_requirement(expr: str) -> str:
    """
    Convert a missing requirement expression into a human-readable sentence.
    Handles both single-course and OR-group prerequisites.
    """
    parts = [p.strip() for p in expr.split(" OR ")]

    # OR group
    if len(parts) > 1:
        # Format: "one of A, B, C, or D"
        if len(parts) == 2:
            options = f"{parts[0]} or {parts[1]}"
        else:
            options = ", ".join(parts[:-1]) + f", or {parts[-1]}"
        return f"You must complete **one of** {options}."

    # Single requirement
    return f"You must complete **{parts[0]}**."


def generate_next_steps(missing: List[str], completed: List[str]) -> str:
    """
    Suggest the fastest path to eligibility.
    This is simple logic for now, but can be expanded later.
    """
    if not missing:
        return "You have completed all requirements."

    # If there's an OR group, suggest the first option
    for expr in missing:
        parts = [p.strip() for p in expr.split(" OR ")]
        if len(parts) > 1:
            return f"Your fastest path is to complete **{parts[0]}**, which satisfies the OR requirement."

    # Otherwise suggest the first missing single prereq
    return f"Your next step is to complete **{missing[0]}**."


def build_explanation(result: Dict) -> Dict:
    """
    Build a hybrid-style explanation from the eligibility result.
    Returns a structured explanation object.
    """
    course_id = result["course_id"]
    eligible = result["eligible"]
    missing = result["missing"]
    completed = result["completed"]

    # Summary
    if eligible:
        summary = f"You are eligible to take **{course_id}**."
    else:
        summary = f"You are **not yet eligible** to take **{course_id}**."

    # Missing requirements (detailed)
    details = []
    for expr in missing:
        details.append(explain_missing_requirement(expr))

    # Next steps
    next_steps = generate_next_steps(missing, completed)

    return {
        "summary": summary,
        "details": details,
        "next_steps": next_steps,
    }