from requirements_service import calculate_distinct_courses, evaluate_degree_combo

# Test 1: CNS + CTIS_MINOR
print("=== CNS + CTIS_MINOR ===")
print(calculate_distinct_courses("CNS", "CTIS_MINOR"))
print(evaluate_degree_combo("CNS", "CTIS_MINOR"))

# Test 2: CTIS + CNS
print("\n=== CTIS + CNS ===")
print(calculate_distinct_courses("CTIS", "CNS"))
print(evaluate_degree_combo("CTIS", "CNS"))

# Test 3: CTIS + CTIS_MINOR
print("\n=== CTIS + CTIS_MINOR ===")
print(calculate_distinct_courses("CTIS", "CTIS_MINOR"))
print(evaluate_degree_combo("CTIS", "CTIS_MINOR"))