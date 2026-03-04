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





# -----------------------------
# CNS MAJOR REQUIREMENTS
# -----------------------------

CNS_CORE = [
    "CTIS 221",  # Fundamentals of Cyber Security (JPS 221)
    "CTIS 320",  # Seminar in Cyber Security and CTIS
    "CTIS 321",  # Operating Systems
    "CTIS 322",  # Networking Computers
    "CTIS 370",  # Cyber and Network Security
    "CTIS 371",  # Digital Forensics
    "CTIS 471",  # Advanced Cyber and Network Security (capstone-level)
]

CNS_INTERNSHIP = ["CTIS 290", "CTIS 390"]  # interchangeable

CNS_ELECTIVES = [
    "BUS 402",   # Business Ethics
    "CTIS 342",  # Database Systems
    "JPS 200",   # Criminal Procedure
    "JPS 330",   # Criminal Investigation
    "JPS 333",   # Criminological Theory
    "PHIL 241",  # Ethics in a Digital World
]

CNS_TOTAL_COURSES_REQUIRED = 10  # 8 core + 1 internship + 2 electives
CNS_TOTAL_CREDITS_REQUIRED = 39  # informational (39–43 depending on internship)


def cns_internship_satisfied(completed: List[str]) -> bool:
    return any(c in completed for c in CNS_INTERNSHIP)


def cns_electives_completed(completed: List[str]) -> List[str]:
    return [c for c in completed if c in CNS_ELECTIVES]


def run_cns_degree_audit(completed: List[str]) -> Dict[str, Any]:
    completed_set = set(completed)

    # Core
    completed_core = [c for c in CNS_CORE if c in completed_set]
    remaining_core = [c for c in CNS_CORE if c not in completed_set]

    # Internship
    internship_ok = cns_internship_satisfied(completed)
    remaining_internship = [] if internship_ok else CNS_INTERNSHIP

    # Electives (need 2)
    completed_electives = cns_electives_completed(completed)
    elective_count = len(completed_electives)
    elective_ok = elective_count >= 2
    remaining_elective_slots = max(0, 2 - elective_count)

    # Remaining elective options (only if needed)
    remaining_elective_options = [] if elective_ok else CNS_ELECTIVES

    # Count toward 10 required courses
    completed_count = (
        len(completed_core)
        + (1 if internship_ok else 0)
        + min(elective_count, 2)
    )

    progress = min(completed_count / CNS_TOTAL_COURSES_REQUIRED, 1.0)

    # -----------------------------
    # Recommended Order
    # -----------------------------
    recommended = []

    # Add all remaining core except CTIS 471
    for course in remaining_core:
        if course != "CTIS 471":
            recommended.append(course)

    # Internship
    if not internship_ok:
        recommended.extend(CNS_INTERNSHIP)

    # Electives (need up to 2)
    if not elective_ok:
        recommended.extend(CNS_ELECTIVES)

    # CTIS 471 last
    if "CTIS 471" in remaining_core:
        recommended.append("CTIS 471")

    return {
        "degree": "CNS Major",
        "completed_core": completed_core,
        "remaining_core": remaining_core,
        "internship_satisfied": internship_ok,
        "completed_electives": completed_electives,
        "elective_slots_required": 2,
        "elective_slots_filled": elective_count,
        "elective_satisfied": elective_ok,
        "remaining_requirements": {
            "core": remaining_core,
            "internship": remaining_internship,
            "elective_options": remaining_elective_options,
            "elective_slots_remaining": remaining_elective_slots,
        },
        "courses_completed_toward_degree": completed_count,
        "total_courses_required": CNS_TOTAL_COURSES_REQUIRED,
        "progress_percent": progress,
        "recommended_order": recommended,
        "notes": (
            f"You have completed {completed_count} of "
            f"{CNS_TOTAL_COURSES_REQUIRED} required courses for the CNS major."
        ),
    }