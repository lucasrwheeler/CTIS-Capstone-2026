from typing import List, Dict, Any

# -----------------------------
# CTIS MAJOR REQUIREMENTS
# -----------------------------

CTIS_CORE = [
    "CTIS 210",  # Programming and Computation
    "CTIS 243",  # Management Information Systems
    "CTIS 310",  # Data Structures and Algorithms
    "CTIS 320",  # Seminar in Cyber Security and CTIS
    "CTIS 321",  # Operating Systems
    "CTIS 322",  # Networking Computers
    "CTIS 342",  # Database Systems
    "CTIS 345",  # Systems Analysis and Design
    "CTIS 440",  # Capstone (must always be last)
]

CTIS_INTERNSHIP = ["CTIS 290", "CTIS 390"]

CTIS_ELECTIVES = [
    "ART 245",
    "CTIS 104",
    "CTIS 221",
    "CTIS 230",
    "CTIS 274",
    "CTIS 331",
    "GEOL 340",
    "MATH 212",
    "PHIL 241",
    "PHIL 292",
    "XD 220",
]

TOTAL_COURSES_REQUIRED = 11
TOTAL_CREDITS_REQUIRED = 43  # informational only


# -----------------------------
# INTERNAL HELPERS
# -----------------------------

def internship_satisfied(completed: List[str]) -> bool:
    return any(c in completed for c in CTIS_INTERNSHIP)


def elective_satisfied(completed: List[str]) -> bool:
    return any(c in completed for c in CTIS_ELECTIVES)


# -----------------------------
# MAIN AUDIT ENGINE
# -----------------------------

def run_ctis_degree_audit(completed: List[str]) -> Dict[str, Any]:
    completed_set = set(completed)

    # Core courses
    completed_core = [c for c in CTIS_CORE if c in completed_set]
    remaining_core = [c for c in CTIS_CORE if c not in completed_set]

    # Internship
    internship_ok = internship_satisfied(completed)
    remaining_internship = [] if internship_ok else CTIS_INTERNSHIP

    # Elective
    elective_ok = elective_satisfied(completed)
    remaining_elective = [] if elective_ok else CTIS_ELECTIVES

    # Count courses toward the 11 required
    completed_count = (
        len(completed_core)
        + (1 if internship_ok else 0)
        + (1 if elective_ok else 0)
    )

    progress = min(completed_count / TOTAL_COURSES_REQUIRED, 1.0)

    # -----------------------------
    # Recommended Order
    # -----------------------------
    # 1. All remaining core EXCEPT CTIS 440
    # 2. Internship (if missing)
    # 3. Elective (if missing)
    # 4. CTIS 440 LAST
    # -----------------------------

    recommended = []

    # Add all remaining core except capstone
    for course in remaining_core:
        if course != "CTIS 440":
            recommended.append(course)

    # Internship
    if not internship_ok:
        recommended.extend(CTIS_INTERNSHIP)

    # Elective
    if not elective_ok:
        recommended.extend(CTIS_ELECTIVES)

    # Capstone last
    if "CTIS 440" in remaining_core:
        recommended.append("CTIS 440")

    # -----------------------------
    # Final structured audit report
    # -----------------------------

    return {
        "degree": "CTIS Major",
        "completed_core": completed_core,
        "remaining_core": remaining_core,
        "internship_satisfied": internship_ok,
        "elective_satisfied": elective_ok,
        "remaining_requirements": {
            "core": remaining_core,
            "internship": remaining_internship,
            "elective_options": remaining_elective,
        },
        "courses_completed_toward_degree": completed_count,
        "total_courses_required": TOTAL_COURSES_REQUIRED,
        "progress_percent": progress,
        "recommended_order": recommended,
        "notes": (
            f"You have completed {completed_count} of "
            f"{TOTAL_COURSES_REQUIRED} required courses for the CTIS major."
        ),
    }