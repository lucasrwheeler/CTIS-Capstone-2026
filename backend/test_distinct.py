from backend.services.requirements_service import (
    calculate_distinct_courses,
    evaluate_degree_combo
)

def run_tests():
    combos = [
        ("CNS", "CTIS_MINOR"),
        ("CTIS", "CNS"),
        ("CTIS", "CTIS_MINOR"),
        ("CNS", "CNS_MINOR")
    ]

    for a, b in combos:
        print(f"\n=== {a} + {b} ===")
        print(calculate_distinct_courses(a, b))
        print(evaluate_degree_combo(a, b))

if __name__ == "__main__":
    run_tests()