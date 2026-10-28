/**
 * SchemaSense - Curriculum-Aligned Exam & Quiz Question Bank
 * 100% Focused on Database Schema Smell Detector Concepts (33 Smells, 1NF-5NF, Indexing, Anomalies, NoSQL)
 * Contains 65 Comprehensive Diagnostic Questions
 */

const EXAM_MODULES = [
  {
    "id": "relational",
    "title": "Relational Integrity Smells (REL-001 - REL-013)",
    "description": "Missing PKs, missing FKs, orphaned references, repeating groups, non-atomic attributes, derived columns."
  },
  {
    "id": "normalization",
    "title": "Normalization Smells (NORM-014 - NORM-019)",
    "description": "1NF violations, 2NF partial dependencies, 3NF transitive dependencies, BCNF, 4NF MVDs, 5NF join dependencies."
  },
  {
    "id": "anomalies",
    "title": "Database Anomalies (ANOM-020 - ANOM-022)",
    "description": "Insert, Update, and Delete anomalies caused by poor relational decomposition and redundancy."
  },
  {
    "id": "indexing",
    "title": "Physical Indexing Smells (IDX-023 - IDX-027)",
    "description": "Missing FK indexes, duplicate/prefix indexes, over-indexing, low-selectivity indexes, index bloat."
  },
  {
    "id": "distributed",
    "title": "Distributed & NoSQL Smells (DIST-028 - DIST-033)",
    "description": "Unbounded document growth (16MB BSON limit), hot shard keys, cross-partition joins, over-denormalization."
  },
  {
    "id": "diagnosis",
    "title": "Schema Smell Diagnosis from SQL DDL",
    "description": "Real-world SQL schema snippets requiring identification of specific smells, severity ratings, and refactorings."
  }
];

const EXAM_QUESTION_BANK = [
  {
    "id": "SMELL-Q01",
    "category": "relational",
    "categoryTitle": "Relational Integrity Smells",
    "smellCode": "REL-001",
    "topic": "Missing Primary Key Smell",
    "difficulty": "Easy",
    "question": "What fundamental relational model integrity rule is violated when a table is created without a PRIMARY KEY constraint (Smell REL-001)?",
    "code": "CREATE TABLE StudentLogs (\n    student_id INT,\n    event_name VARCHAR(100),\n    event_timestamp TIMESTAMP\n);",
    "options": [
      "Referential Integrity Rule",
      "Entity Integrity Rule (Tuples must be uniquely identifiable and non-null)",
      "Domain Integrity Rule",
      "Functional Dependency Closure Rule"
    ],
    "correctIndex": 1,
    "explanation": "REL-001 flags a Missing Primary Key. Under Codd's Entity Integrity Rule, every relation must possess a primary key consisting of non-null attributes that uniquely distinguishes each tuple in the relation."
  },
  {
    "id": "SMELL-Q02",
    "category": "relational",
    "categoryTitle": "Relational Integrity Smells",
    "smellCode": "REL-002",
    "topic": "Missing Foreign Key Smell",
    "difficulty": "Medium",
    "question": "In the following schema, why does SchemaSense flag column 'dept_id' in table 'Employee' with smell REL-002 (Missing Foreign Key)?",
    "code": "CREATE TABLE Department (\n    dept_id INT PRIMARY KEY,\n    dept_name VARCHAR(100) NOT NULL\n);\n\nCREATE TABLE Employee (\n    emp_id INT PRIMARY KEY,\n    name VARCHAR(100) NOT NULL,\n    dept_id INT\n);",
    "options": [
      "Because dept_id has an incompatible numeric datatype with dept_name.",
      "Because dept_id shares a name with Department's primary key but lacks an explicit FOREIGN KEY REFERENCES constraint, risking orphaned records.",
      "Because Employee requires a composite primary key consisting of (emp_id, dept_id).",
      "Because dept_id must always be defined as NOT NULL."
    ],
    "correctIndex": 1,
    "explanation": "REL-002 flags columns whose names match primary keys of other tables or end in '_id' but lack an explicit FOREIGN KEY constraint. Without referential integrity constraints, employees can be inserted with nonexistent department IDs."
  },
  {
    "id": "SMELL-Q03",
    "category": "relational",
    "categoryTitle": "Relational Integrity Smells",
    "smellCode": "REL-003",
    "topic": "Orphaned Foreign Key Smell",
    "difficulty": "Medium",
    "question": "What is the Orphaned Foreign Key smell (REL-003) detected by SchemaSense?",
    "options": [
      "A foreign key column that points to an unindexed column.",
      "A foreign key constraint that references a non-existent table or a table missing from the current schema script.",
      "A foreign key that contains circular cascade delete rules.",
      "A foreign key defined on a nullable column."
    ],
    "correctIndex": 1,
    "explanation": "REL-003 occurs when a table's FOREIGN KEY references a table or column that does not exist in the catalog or schema script, leading to DDL compilation failure or dangling referential targets."
  },
  {
    "id": "SMELL-Q04",
    "category": "relational",
    "categoryTitle": "Relational Integrity Smells",
    "smellCode": "REL-004",
    "topic": "Missing NOT NULL Constraint",
    "difficulty": "Easy",
    "question": "Which column in the following table represents a Missing NOT NULL smell (REL-004) on a business-critical identifying attribute?",
    "code": "CREATE TABLE UserAccount (\n    user_id INT PRIMARY KEY,\n    email VARCHAR(255),\n    password_hash VARCHAR(255),\n    last_login TIMESTAMP\n);",
    "options": [
      "last_login because timestamp columns must always be recorded.",
      "user_id because it is the primary key.",
      "email and password_hash because authentication credentials should never permit NULL values.",
      "None; all non-primary key columns should be nullable by default."
    ],
    "correctIndex": 2,
    "explanation": "REL-004 flags critical domain attributes like emails, password hashes, usernames, and transaction totals that lack NOT NULL constraints, allowing invalid blank records into the database."
  },
  {
    "id": "SMELL-Q05",
    "category": "relational",
    "categoryTitle": "Relational Integrity Smells",
    "smellCode": "REL-005",
    "topic": "Missing UNIQUE Constraint on Candidate Key",
    "difficulty": "Medium",
    "question": "In a table storing registered vehicles, 'license_plate' is an alternate candidate key. What smell occurs if neither UNIQUE nor PRIMARY KEY is defined on it?",
    "options": [
      "REL-005 (Missing UNIQUE Constraint), permitting accidental duplicate vehicle registrations.",
      "REL-010 (Inconsistent Datatype).",
      "NORM-014 (1NF violation).",
      "IDX-026 (Low-Selectivity Index)."
    ],
    "correctIndex": 0,
    "explanation": "REL-005 identifies alternate candidate keys (e.g. email, SSN, passport_no, license_plate) that lack a UNIQUE constraint, permitting duplicate entries for logically distinct entities."
  },
  {
    "id": "SMELL-Q06",
    "category": "relational",
    "categoryTitle": "Relational Integrity Smells",
    "smellCode": "REL-006",
    "topic": "Redundant / Duplicated Column Smell",
    "difficulty": "Medium",
    "question": "In the schema below, which smell is present across Customer and Orders tables?",
    "code": "CREATE TABLE Customer (\n    customer_id INT PRIMARY KEY,\n    customer_name VARCHAR(100),\n    customer_address VARCHAR(200)\n);\n\nCREATE TABLE Orders (\n    order_id INT PRIMARY KEY,\n    customer_id INT REFERENCES Customer(customer_id),\n    customer_address VARCHAR(200)\n);",
    "options": [
      "NORM-019 (5NF Join Dependency violation).",
      "REL-006 (Redundant Column Smell), because customer_address is stored twice and risks update anomalies.",
      "IDX-023 (Missing FK Index).",
      "REL-001 (Missing Primary Key)."
    ],
    "correctIndex": 1,
    "explanation": "REL-006 identifies duplicated non-key columns across related tables. 'customer_address' belongs in Customer; replicating it in Orders without justification creates redundant copies that fall out of sync when updated."
  },
  {
    "id": "SMELL-Q07",
    "category": "relational",
    "categoryTitle": "Relational Integrity Smells",
    "smellCode": "REL-007",
    "topic": "Multivalued / Non-Atomic Attribute Smell",
    "difficulty": "Easy",
    "question": "Why does SchemaSense flag 'phone_numbers VARCHAR(255)' storing comma-separated values as smell REL-007 (and NORM-014)?",
    "code": "CREATE TABLE Contact (\n    contact_id INT PRIMARY KEY,\n    full_name VARCHAR(100),\n    phone_numbers VARCHAR(255) -- stores: '9876543210, 9845012345'\n);",
    "options": [
      "Because phone numbers should only ever be stored as INT.",
      "Because comma-separated strings violate domain atomicity, making LIKE searches slow and breaking indexing.",
      "Because a table cannot have more than 2 columns.",
      "Because phone numbers require a foreign key to a telecom registry."
    ],
    "correctIndex": 1,
    "explanation": "REL-007 / NORM-014 flags multivalued attributes packing multiple values into a single cell. This violates First Normal Form (1NF) and requires inefficient wildcard LIKE queries to search individual numbers."
  },
  {
    "id": "SMELL-Q08",
    "category": "relational",
    "categoryTitle": "Relational Integrity Smells",
    "smellCode": "REL-008",
    "topic": "Repeating Groups / Enumerative Columns",
    "difficulty": "Easy",
    "question": "Consider the following schema. What design smell is demonstrated by phone1, phone2, and phone3?",
    "code": "CREATE TABLE Client (\n    client_id INT PRIMARY KEY,\n    name VARCHAR(100),\n    phone1 VARCHAR(20),\n    phone2 VARCHAR(20),\n    phone3 VARCHAR(20)\n);",
    "options": [
      "REL-008 (Repeating Groups / Enumerative Attribute Pattern).",
      "NORM-017 (BCNF violation).",
      "IDX-025 (Over-indexed table).",
      "ANOM-020 (Insert Anomaly)."
    ],
    "correctIndex": 0,
    "explanation": "REL-008 flags repeating numbered columns (phone1, phone2, tag1, tag2). It sets an artificial limit (max 3 phones), wastes storage with NULLs, and complicates queries (requires checking OR phone1 = X OR phone2 = X)."
  },
  {
    "id": "SMELL-Q09",
    "category": "relational",
    "categoryTitle": "Relational Integrity Smells",
    "smellCode": "REL-009",
    "topic": "Stored Derived / Calculable Attribute Smell",
    "difficulty": "Medium",
    "question": "Why does SchemaSense flag 'total_amount' in an OrderDetails table as smell REL-009?",
    "code": "CREATE TABLE OrderItem (\n    item_id INT PRIMARY KEY,\n    unit_price DECIMAL(10,2) NOT NULL,\n    quantity INT NOT NULL,\n    total_amount DECIMAL(10,2) -- stored as unit_price * quantity\n);",
    "options": [
      "Because decimal types cannot be multiplied in SQL.",
      "Because storing derived data without generated column (VIRTUAL/STORED) or trigger synchronization risks inconsistency if unit_price or quantity changes.",
      "Because total_amount must be an integer.",
      "Because OrderItem violates 2NF."
    ],
    "correctIndex": 1,
    "explanation": "REL-009 flags stored derived attributes. If 'unit_price' or 'quantity' is updated but 'total_amount' is not recalculated simultaneously, the database becomes internally inconsistent."
  },
  {
    "id": "SMELL-Q10",
    "category": "relational",
    "categoryTitle": "Relational Integrity Smells",
    "smellCode": "REL-010",
    "topic": "Inconsistent Datatype Across Foreign Key",
    "difficulty": "Medium",
    "question": "In the schema below, what smell is detected between Department.dept_id and Employee.dept_id?",
    "code": "CREATE TABLE Department (\n    dept_id BIGINT PRIMARY KEY,\n    dept_name VARCHAR(100)\n);\n\nCREATE TABLE Employee (\n    emp_id INT PRIMARY KEY,\n    name VARCHAR(100),\n    dept_id VARCHAR(50) REFERENCES Department(dept_id)\n);",
    "options": [
      "REL-010 (Inconsistent Datatype Across Foreign Key Reference).",
      "REL-001 (Missing Primary Key).",
      "NORM-016 (Transitive Dependency).",
      "IDX-024 (Duplicate Index)."
    ],
    "correctIndex": 0,
    "explanation": "REL-010 flags mismatched datatypes between a Foreign Key and its referenced Primary Key (BIGINT vs VARCHAR). In many RDBMSs this causes constraint failure or forces implicit type casts that disable index scans during JOINs."
  },
  {
    "id": "SMELL-Q11",
    "category": "relational",
    "categoryTitle": "Relational Integrity Smells",
    "smellCode": "REL-011",
    "topic": "Excessive Nullable Columns / Sparse Table Smell",
    "difficulty": "Medium",
    "question": "When a table has 40 columns and 35 of them are NULLABLE representing various subtypes (e.g. Patient, Inpatient, Outpatient all in one table), which smell is present?",
    "options": [
      "REL-011 (Excessive Nullable Columns / Sparse Table Anti-Pattern).",
      "NORM-018 (4NF Multivalued Dependency).",
      "IDX-027 (Wide Index Smell).",
      "DIST-032 (NoSQL Model Mismatch)."
    ],
    "correctIndex": 0,
    "explanation": "REL-011 flags sparse tables where many columns are NULL because the table lumps multiple distinct subtypes into a single relation. The recommended refactoring is table inheritance (Class Table Inheritance or Separate Subtype Tables)."
  },
  {
    "id": "SMELL-Q12",
    "category": "relational",
    "categoryTitle": "Relational Integrity Smells",
    "smellCode": "REL-012",
    "topic": "Poor Naming / Reserved Keyword Identifier Smell",
    "difficulty": "Easy",
    "question": "Which table definition triggers smell REL-012 (Poor Identifier Naming / Reserved Keywords)?",
    "code": "CREATE TABLE [Order Details Table] (\n    select INT PRIMARY KEY,\n    [User Name] VARCHAR(100),\n    date TIMESTAMP\n);",
    "options": [
      "Using spaces in table/column names and SQL reserved keywords ('select', 'date') as column names.",
      "Having a primary key named 'select'.",
      "Using square brackets.",
      "All of the above."
    ],
    "correctIndex": 3,
    "explanation": "REL-012 identifies identifiers containing spaces, special characters, or SQL reserved words (like SELECT, ORDER, DATE, GROUP) that require cumbersome quoting in every SQL query."
  },
  {
    "id": "SMELL-Q13",
    "category": "relational",
    "categoryTitle": "Relational Integrity Smells",
    "smellCode": "REL-013",
    "topic": "God Table / Monolithic Table Smell",
    "difficulty": "Medium",
    "question": "What threshold typically causes SchemaSense to flag a table with smell REL-013 ('God Table' / Monolithic Table)?",
    "options": [
      "The table contains more than 10 rows.",
      "The table contains more than 25-30 attributes mixing multiple disparate entities into a single relation.",
      "The table has two foreign keys.",
      "The table uses VARCHAR datatypes."
    ],
    "correctIndex": 1,
    "explanation": "REL-013 flags monolithic 'God Tables' with an excessive number of attributes (>25-30) that combine data about customers, orders, payments, and shipping into a single bloated table."
  },
  {
    "id": "SMELL-Q14",
    "category": "relational",
    "categoryTitle": "Relational Integrity Smells",
    "smellCode": "REL-002",
    "topic": "Referential Integrity Cascade Missing",
    "difficulty": "Hard",
    "question": "When defining child records that cannot exist without their parent (e.g. OrderItems of an Order), omitting ON DELETE CASCADE or ON DELETE RESTRICT risks what smell?",
    "options": [
      "Orphaned Child Tuples or Unexpected Foreign Key Deletion Errors.",
      "Transitive Functional Dependency (3NF).",
      "Index Cardinality Inversion.",
      "Lost Update Anomaly."
    ],
    "correctIndex": 0,
    "explanation": "Under referential integrity, strong parent-child compositions (like Order -> OrderItems) should declare explicit ON DELETE CASCADE or ON DELETE RESTRICT behavior to prevent orphaned child rows or foreign key integrity violations upon deletion."
  },
  {
    "id": "SMELL-Q15",
    "category": "relational",
    "categoryTitle": "Relational Integrity Smells",
    "smellCode": "REL-001",
    "topic": "Composite Key Over-Specification",
    "difficulty": "Hard",
    "question": "A table defines a composite primary key consisting of 6 columns (A, B, C, D, E, F). What schema smell or design penalty is primarily incurred?",
    "options": [
      "Severe index bloat, bloated foreign keys in all child tables, and high query join complexity.",
      "Automatic violation of 1NF.",
      "Immediate conversion into a document store.",
      "Loss of attribute closure."
    ],
    "correctIndex": 0,
    "explanation": "Overly wide composite primary keys force every child foreign key and secondary index to replicate all 6 columns, causing massive storage inflation and complex multi-column join predicates. A surrogate key is recommended."
  },
  {
    "id": "SMELL-Q16",
    "category": "normalization",
    "categoryTitle": "Normalization Smells",
    "smellCode": "NORM-014",
    "topic": "First Normal Form (1NF) Violation",
    "difficulty": "Easy",
    "question": "Which condition is REQUIRED for a relation to be in First Normal Form (1NF)?",
    "options": [
      "All non-key attributes must be fully functionally dependent on the primary key.",
      "Every attribute domain must consist only of atomic (indivisible) values, with no repeating groups or nested relations.",
      "No non-prime attribute is transitively dependent on any candidate key.",
      "Every determinant is a superkey."
    ],
    "correctIndex": 1,
    "explanation": "First Normal Form (1NF) mandates that the values in each column are atomic (indivisible) and there are no repeating groups or composite/array attributes (E.F. Codd, 1970)."
  },
  {
    "id": "SMELL-Q17",
    "category": "normalization",
    "categoryTitle": "Normalization Smells",
    "smellCode": "NORM-015",
    "topic": "Second Normal Form (2NF) Partial Dependency Smell",
    "difficulty": "Medium",
    "question": "Consider table Enrollment(student_id, course_id, student_name, grade). The candidate key is (student_id, course_id). We have FD: student_id -> student_name. Why does SchemaSense flag this as NORM-015?",
    "options": [
      "student_name is non-prime and depends on only a proper subset (student_id) of the composite primary key, constituting a Partial Dependency.",
      "student_id is not a foreign key.",
      "grade is transitively dependent on student_name.",
      "student_name violates 1NF atomicity."
    ],
    "correctIndex": 0,
    "explanation": "NORM-015 flags Second Normal Form (2NF) violations. A relation is in 2NF if it is in 1NF and no non-prime attribute is partially dependent on any candidate key. Here student_name depends only on student_id, not the full composite key."
  },
  {
    "id": "SMELL-Q18",
    "category": "normalization",
    "categoryTitle": "Normalization Smells",
    "smellCode": "NORM-015",
    "topic": "Can a Table with a Single-Attribute Primary Key Violate 2NF?",
    "difficulty": "Easy",
    "question": "If a relation has a single-attribute primary key (e.g. employee_id), can it violate Second Normal Form (2NF)?",
    "options": [
      "Yes, if it has repeating groups.",
      "No, because a single-attribute key has no proper subsets; thus partial dependencies are mathematically impossible.",
      "Yes, if there are transitive dependencies.",
      "Yes, if there are multivalued dependencies."
    ],
    "correctIndex": 1,
    "explanation": "A partial dependency requires a proper subset of a candidate key. If the candidate key has only 1 attribute, no non-empty proper subset can exist, so any 1NF relation with a single-attribute key is automatically in 2NF."
  },
  {
    "id": "SMELL-Q19",
    "category": "normalization",
    "categoryTitle": "Normalization Smells",
    "smellCode": "NORM-016",
    "topic": "Third Normal Form (3NF) Transitive Dependency Smell",
    "difficulty": "Medium",
    "question": "In table Employee(emp_id, emp_name, dept_id, dept_name), with PK emp_id, we have: emp_id -> dept_id, and dept_id -> dept_name. Why does this trigger smell NORM-016?",
    "options": [
      "dept_name is non-prime and transitively dependent on the primary key emp_id via non-prime attribute dept_id.",
      "emp_id is partially dependent on dept_name.",
      "dept_id is a multi-valued attribute.",
      "The table lacks a foreign key constraint."
    ],
    "correctIndex": 0,
    "explanation": "NORM-016 flags Third Normal Form (3NF) violations. A relation in 2NF violates 3NF if a non-prime attribute (dept_name) depends on another non-prime attribute (dept_id), forming a Transitive Dependency from the primary key."
  },
  {
    "id": "SMELL-Q20",
    "category": "normalization",
    "categoryTitle": "Normalization Smells",
    "smellCode": "NORM-016",
    "topic": "Formal Definition of 3NF Condition",
    "difficulty": "Hard",
    "question": "A relation R is in Third Normal Form (3NF) if for every non-trivial functional dependency X -> A, which of the following holds?",
    "options": [
      "X is a superkey OR A is a prime attribute (member of some candidate key).",
      "X is a candidate key AND A is non-prime.",
      "A is a superkey.",
      "X is a single attribute."
    ],
    "correctIndex": 0,
    "explanation": "By definition, a relation is in 3NF if for every non-trivial FD X -> A, either X is a superkey of R, or A is a prime attribute (i.e. contained in a candidate key of R)."
  },
  {
    "id": "SMELL-Q21",
    "category": "normalization",
    "categoryTitle": "Normalization Smells",
    "smellCode": "NORM-017",
    "topic": "Boyce-Codd Normal Form (BCNF) Smell",
    "difficulty": "Hard",
    "question": "How does Boyce-Codd Normal Form (BCNF, smell NORM-017) differ from Third Normal Form (3NF)?",
    "options": [
      "BCNF allows non-prime attributes to determine superkeys.",
      "BCNF removes the exception 'OR A is a prime attribute'; in BCNF, for EVERY non-trivial FD X -> A, X MUST be a superkey.",
      "BCNF requires multi-valued dependencies to be trivial.",
      "BCNF applies only to tables with foreign keys."
    ],
    "correctIndex": 1,
    "explanation": "BCNF is strictly stronger than 3NF. In 3NF, X -> A is allowed if A is prime even when X is not a superkey. BCNF eliminates this exception: every determinant X in every non-trivial FD MUST be a superkey."
  },
  {
    "id": "SMELL-Q22",
    "category": "normalization",
    "categoryTitle": "Normalization Smells",
    "smellCode": "NORM-017",
    "topic": "Classic BCNF Violation Scenario",
    "difficulty": "Hard",
    "question": "Relation StudentAdvising(student_id, subject, advisor) has candidate keys (student_id, subject). Each student has one advisor per subject, but an advisor advises only ONE subject: advisor -> subject. Why is this in 3NF but NOT in BCNF?",
    "options": [
      "Because advisor is a foreign key.",
      "In advisor -> subject, 'subject' is a prime attribute (belongs to candidate key), satisfying 3NF. But 'advisor' is NOT a superkey, violating BCNF.",
      "Because student_id is not unique.",
      "Because it has a join dependency."
    ],
    "correctIndex": 1,
    "explanation": "In advisor -> subject, subject is part of candidate key (student_id, subject), which satisfies 3NF's second condition (A is prime). However, advisor cannot determine student_id, so advisor is not a superkey, triggering smell NORM-017 (BCNF violation)."
  },
  {
    "id": "SMELL-Q23",
    "category": "normalization",
    "categoryTitle": "Normalization Smells",
    "smellCode": "NORM-018",
    "topic": "Fourth Normal Form (4NF) & Multivalued Dependencies",
    "difficulty": "Hard",
    "question": "What schema smell is represented by NORM-018 (Fourth Normal Form violation)?",
    "options": [
      "Storing two independent 1-to-N or N-to-N relationships in the same table (e.g. EmployeeSkillsLanguages), creating a Cartesian product of tuples.",
      "Having more than one foreign key.",
      "Using JSON columns in PostgreSQL.",
      "Having a surrogate primary key."
    ],
    "correctIndex": 0,
    "explanation": "NORM-018 flags 4NF violations caused by non-trivial Multivalued Dependencies (MVDs: X ->> Y). Storing independent multi-valued facts (e.g., an employee's 3 skills and 4 languages) forces 12 tuples to represent 7 independent facts."
  },
  {
    "id": "SMELL-Q24",
    "category": "normalization",
    "categoryTitle": "Normalization Smells",
    "smellCode": "NORM-019",
    "topic": "Fifth Normal Form (5NF / Project-Join Normal Form)",
    "difficulty": "Hard",
    "question": "When does a schema exhibit smell NORM-019 (Fifth Normal Form / 5NF violation)?",
    "options": [
      "When a table can be decomposed losslessly into three or more projections, but CANNOT be decomposed into two projections without losing join semantics.",
      "When a table has 5 foreign keys.",
      "When all columns are strings.",
      "When the primary key contains 5 columns."
    ],
    "correctIndex": 0,
    "explanation": "NORM-019 represents Project-Join Normal Form (5NF) violations. A relation is in 5NF if every non-trivial join dependency *{R1, R2, ..., Rn} on R is implied by the candidate keys of R."
  },
  {
    "id": "SMELL-Q25",
    "category": "normalization",
    "categoryTitle": "Normalization Smells",
    "smellCode": "NORM-015",
    "topic": "Refactoring a 2NF Violation",
    "difficulty": "Medium",
    "question": "How does SchemaSense recommend refactoring a table with smell NORM-015 (Partial Dependency)?",
    "options": [
      "Delete the non-prime attribute entirely.",
      "Decompose the table into two relations: one containing the full key and fully dependent attributes, and another containing the determinant subset and partially dependent attributes.",
      "Combine all attributes into a comma-separated string.",
      "Add a B+ tree index on all columns."
    ],
    "correctIndex": 1,
    "explanation": "Refactoring 2NF requires projection decomposition: move the partially dependent attributes and their determinant subset into a new table, leaving the determinant as a foreign key."
  },
  {
    "id": "SMELL-Q26",
    "category": "normalization",
    "categoryTitle": "Normalization Smells",
    "smellCode": "NORM-016",
    "topic": "Attribute Closure Algorithm in Smell Detection",
    "difficulty": "Hard",
    "question": "How does SchemaSense's dependency engine automatically detect candidate keys and normalization smells from a set of Functional Dependencies F?",
    "options": [
      "By sorting column names alphabetically.",
      "By computing the Attribute Closure (X+) for subsets of attributes using Armstrong's Axioms until all relation attributes are covered.",
      "By counting foreign key references.",
      "By inspecting table row counts."
    ],
    "correctIndex": 1,
    "explanation": "SchemaSense implements the Attribute Closure algorithm (X+). If X+ contains all attributes of R and no proper subset of X does, then X is a candidate key. Any FD violating 2NF or 3NF definitions against these candidate keys is flagged."
  },
  {
    "id": "SMELL-Q27",
    "category": "normalization",
    "categoryTitle": "Normalization Smells",
    "smellCode": "NORM-016",
    "topic": "Prime vs Non-Prime Attributes",
    "difficulty": "Medium",
    "question": "In relational database normalization theory, what is the precise definition of a 'Prime Attribute'?",
    "options": [
      "An attribute that is an integer or prime number.",
      "An attribute that is a member of AT LEAST ONE candidate key of the relation.",
      "An attribute that cannot be NULL.",
      "An attribute that references another table."
    ],
    "correctIndex": 1,
    "explanation": "A Prime Attribute is any attribute that is a constituent member of at least one candidate key of the relation. All other attributes are classified as Non-Prime attributes."
  },
  {
    "id": "SMELL-Q28",
    "category": "normalization",
    "categoryTitle": "Normalization Smells",
    "smellCode": "NORM-017",
    "topic": "BCNF Decomposition Trade-off",
    "difficulty": "Hard",
    "question": "What is the potential trade-off when decomposing a 3NF relation into BCNF to eliminate all determinant smells?",
    "options": [
      "The decomposition is always lossy.",
      "Functional Dependency Preservation may be lost (checking an FD may require an expensive inter-table join).",
      "The primary key becomes composite.",
      "Disk space usage doubles."
    ],
    "correctIndex": 1,
    "explanation": "While 3NF lossless join and dependency-preserving decomposition is always achievable, BCNF decomposition guarantees lossless joins but does NOT always preserve functional dependencies."
  },
  {
    "id": "SMELL-Q29",
    "category": "normalization",
    "categoryTitle": "Normalization Smells",
    "smellCode": "NORM-014",
    "topic": "1NF Violation in Relational Schema Builder",
    "difficulty": "Easy",
    "question": "Which column definition in a relational database schema directly violates First Normal Form (1NF)?",
    "options": [
      "tags VARCHAR(255) storing comma-separated values like 'tech,ai,cloud'",
      "created_at TIMESTAMP NOT NULL",
      "is_active BOOLEAN DEFAULT TRUE",
      "user_id INT PRIMARY KEY"
    ],
    "correctIndex": 0,
    "explanation": "Storing delimited list items ('tech,ai,cloud') in a single column violates First Normal Form (atomicity). It should be decomposed into a separate Tag table with a foreign key."
  },
  {
    "id": "SMELL-Q30",
    "category": "normalization",
    "categoryTitle": "Normalization Smells",
    "smellCode": "NORM-016",
    "topic": "Denormalization Smell vs Performance Trade-off",
    "difficulty": "Medium",
    "question": "When a developer intentionally keeps a 3NF transitive dependency (e.g. storing customer_name in Orders table to avoid a JOIN), what is this practice called, and what is its primary danger?",
    "options": [
      "Intentional Denormalization; danger is Update Anomaly if customer_name changes in Customer but not Orders.",
      "Horizontal Partitioning; danger is network partition.",
      "B+ Tree inlining; danger is index bloat.",
      "Strict Serializability; danger is transaction abort."
    ],
    "correctIndex": 0,
    "explanation": "Intentional Denormalization skips normalization to avoid JOIN latency on read queries. Its fundamental danger is data inconsistency via Update Anomalies whenever the replicated data changes."
  },
  {
    "id": "SMELL-Q31",
    "category": "anomalies",
    "categoryTitle": "Database Anomalies",
    "smellCode": "ANOM-020",
    "topic": "Insert Anomaly Smell",
    "difficulty": "Medium",
    "question": "In a unnormalized table CourseEnrollment(student_id, course_id, course_name, instructor), why does an Insert Anomaly (ANOM-020) occur?",
    "options": [
      "We cannot record a newly introduced course until at least one student enrolls in it, because student_id is part of the primary key and cannot be NULL.",
      "We cannot enroll a student in more than one course.",
      "Course names cannot contain numbers.",
      "The table contains too many rows."
    ],
    "correctIndex": 0,
    "explanation": "An Insert Anomaly (ANOM-020) occurs when an independent entity (a new course) cannot be recorded in the database without creating fictitious or NULL values for another unrelated entity (student)."
  },
  {
    "id": "SMELL-Q32",
    "category": "anomalies",
    "categoryTitle": "Database Anomalies",
    "smellCode": "ANOM-021",
    "topic": "Update Anomaly Smell",
    "difficulty": "Easy",
    "question": "In an unnormalized employee-department table where 'department_budget' is duplicated across 500 employee rows, what happens during an Update Anomaly (ANOM-021)?",
    "options": [
      "If the department budget changes, all 500 rows must be updated; updating only some leaves the database in an inconsistent state.",
      "The primary key automatically increments.",
      "The database server crashes.",
      "The foreign key is deleted."
    ],
    "correctIndex": 0,
    "explanation": "An Update Anomaly (ANOM-021) arises from redundant data. Updating a single business fact requires modifying multiple tuples; failure to update all copies causes data corruption."
  },
  {
    "id": "SMELL-Q33",
    "category": "anomalies",
    "categoryTitle": "Database Anomalies",
    "smellCode": "ANOM-022",
    "topic": "Delete Anomaly Smell",
    "difficulty": "Medium",
    "question": "In table StudentAdvisor(student_id, advisor_id, advisor_office), if the last student assigned to Advisor Dr. Smith graduates and their row is deleted, what Delete Anomaly (ANOM-022) occurs?",
    "options": [
      "Dr. Smith's office location is accidentally purged from the database entirely.",
      "The database drops the table.",
      "All other students are reassigned to Dr. Smith.",
      "A foreign key constraint violation is raised."
    ],
    "correctIndex": 0,
    "explanation": "A Delete Anomaly (ANOM-022) occurs when deleting tuples representing one fact (a student graduating) inadvertently destroys critical information regarding another independent entity (the advisor's office location)."
  },
  {
    "id": "SMELL-Q34",
    "category": "anomalies",
    "categoryTitle": "Database Anomalies",
    "smellCode": "ANOM-021",
    "topic": "Root Cause of Anomalies",
    "difficulty": "Easy",
    "question": "What is the primary theoretical root cause of Insert, Update, and Delete anomalies in relational schemas?",
    "options": [
      "Data Redundancy resulting from unnormalized relations with partial or transitive functional dependencies.",
      "Lack of RAM on the database server.",
      "Using SQL instead of NoSQL.",
      "Having too many indexes."
    ],
    "correctIndex": 0,
    "explanation": "Anomalies are the direct consequence of Data Redundancy caused by mixing independent facts in the same relation (violating 2NF, 3NF, or BCNF)."
  },
  {
    "id": "SMELL-Q35",
    "category": "anomalies",
    "categoryTitle": "Database Anomalies",
    "smellCode": "ANOM-020",
    "topic": "Insert Anomaly in E-Commerce Cart",
    "difficulty": "Medium",
    "question": "A table CartItems(cart_id, item_id, item_price, item_description) has PK (cart_id, item_id). Why can a store owner not add new catalog items to the database using this table?",
    "options": [
      "Because an item cannot exist in the catalog until someone places it in an active cart (cart_id cannot be NULL in the PK).",
      "Because item_price is a float.",
      "Because carts expire after 30 minutes.",
      "Because item_description exceeds 255 characters."
    ],
    "correctIndex": 0,
    "explanation": "This is an Insert Anomaly (ANOM-020). Catalog items belong in an Item table. Combining cart and catalog data prevents registering products that have not yet been added to an active cart."
  },
  {
    "id": "SMELL-Q36",
    "category": "anomalies",
    "categoryTitle": "Database Anomalies",
    "smellCode": "ANOM-022",
    "topic": "Neutralizing Delete Anomalies",
    "difficulty": "Medium",
    "question": "What is the formal solution to neutralize the Delete Anomaly in StudentAdvisor(student_id, student_name, advisor_id, advisor_name)?",
    "options": [
      "Decompose into Student(student_id, student_name, advisor_id) and Advisor(advisor_id, advisor_name).",
      "Never delete any records; only use soft deletes.",
      "Add a surrogate key ID.",
      "Create a composite index on (student_id, advisor_id)."
    ],
    "correctIndex": 0,
    "explanation": "Lossless join decomposition separates the Student entity from the Advisor entity into two relations, allowing students to be deleted without erasing advisor profiles."
  },
  {
    "id": "SMELL-Q37",
    "category": "anomalies",
    "categoryTitle": "Database Anomalies",
    "smellCode": "ANOM-021",
    "topic": "Update Anomaly in Hospital Schema",
    "difficulty": "Easy",
    "question": "In PatientAdmission(patient_id, doctor_id, doctor_phone), Dr. Patel is assigned to 40 admitted patients. When Dr. Patel changes phone numbers, updating 39 rows and missing 1 row results in:",
    "options": [
      "Inconsistent data state caused by an Update Anomaly.",
      "A Deadlock.",
      "A BCNF violation.",
      "A CAP theorem partition."
    ],
    "correctIndex": 0,
    "explanation": "Because doctor_phone is transitively dependent on doctor_id, failing to update all redundant instances produces contradictory information for Dr. Patel across different patient rows."
  },
  {
    "id": "SMELL-Q38",
    "category": "anomalies",
    "categoryTitle": "Database Anomalies",
    "smellCode": "ANOM-020",
    "topic": "Anomalies in 3NF Normalized Schemas",
    "difficulty": "Hard",
    "question": "Can a schema in 3NF still suffer from modification anomalies if it is NOT in BCNF?",
    "options": [
      "Yes, because when overlapping candidate keys exist, dependencies between prime attributes can still cause anomalies.",
      "No, 3NF completely eliminates all possible anomalies.",
      "Only in distributed databases.",
      "Only if tables contain more than 10,000 rows."
    ],
    "correctIndex": 0,
    "explanation": "Yes. 3NF permits non-trivial FDs X -> A where X is not a superkey provided A is prime. This exception can still harbor redundancy and anomalies when multiple overlapping candidate keys exist."
  },
  {
    "id": "SMELL-Q39",
    "category": "indexing",
    "categoryTitle": "Physical Indexing Smells",
    "smellCode": "IDX-023",
    "topic": "Missing Index on Foreign Key Column",
    "difficulty": "Medium",
    "question": "Why does SchemaSense flag table 'OrderDetails(order_id, product_id)' when column 'product_id' lacks a secondary index (Smell IDX-023)?",
    "options": [
      "Because without an index on product_id, JOIN queries on products and parent DELETE/UPDATE cascade operations trigger full table scans.",
      "Because primary keys cannot exist without foreign key indexes.",
      "Because RDBMS engines automatically reject foreign keys without indexes.",
      "Because B+ trees only support single-column indexes."
    ],
    "correctIndex": 0,
    "explanation": "IDX-023 flags foreign keys without an index. Foreign keys are heavily utilized in JOIN conditions and parent referential integrity cascade locks. Omitting an index forces sequential table scans."
  },
  {
    "id": "SMELL-Q40",
    "category": "indexing",
    "categoryTitle": "Physical Indexing Smells",
    "smellCode": "IDX-024",
    "topic": "Redundant / Duplicate Left-Prefix Index Smell",
    "difficulty": "Medium",
    "question": "In the following DDL, why is index 'idx_cust' flagged as smell IDX-024 (Redundant Prefix Index)?",
    "code": "CREATE TABLE Orders (\n    order_id INT PRIMARY KEY,\n    customer_id INT,\n    order_date DATE\n);\n\nCREATE INDEX idx_cust_date ON Orders (customer_id, order_date);\nCREATE INDEX idx_cust ON Orders (customer_id);",
    "options": [
      "Because B+ trees evaluate compound indexes using the Leftmost Prefix Rule; queries filtering by customer_id are already satisfied by idx_cust_date.",
      "Because two indexes cannot be created on the same table.",
      "Because customer_id is not a primary key.",
      "Because order_date cannot be indexed."
    ],
    "correctIndex": 0,
    "explanation": "IDX-024 flags duplicate prefix indexes. Under the B+ tree leftmost prefix matching rule, the composite index (customer_id, order_date) already covers queries on (customer_id). The single-column index wastes disk space and slows down write operations."
  },
  {
    "id": "SMELL-Q41",
    "category": "indexing",
    "categoryTitle": "Physical Indexing Smells",
    "smellCode": "IDX-025",
    "topic": "Over-Indexed Table Smell",
    "difficulty": "Medium",
    "question": "What performance consequence occurs when a table has 8 columns and 7 separate secondary indexes (Smell IDX-025: Over-Indexed Table)?",
    "options": [
      "Severe write amplification: every INSERT, UPDATE, and DELETE must update all 7 B+ tree structures, dramatically degrading DML throughput.",
      "SELECT query execution time degrades by 100x.",
      "The table automatically converts to First Normal Form.",
      "Database crashes due to lock exhaustion."
    ],
    "correctIndex": 0,
    "explanation": "IDX-025 flags over-indexing. While indexes speed up SELECTs, each index adds maintenance overhead on every write (insert, update, delete) and consumes memory in the database buffer pool."
  },
  {
    "id": "SMELL-Q42",
    "category": "indexing",
    "categoryTitle": "Physical Indexing Smells",
    "smellCode": "IDX-026",
    "topic": "Low-Selectivity / Low-Cardinality Index Smell",
    "difficulty": "Medium",
    "question": "Why does SchemaSense flag creating a B+ tree index on column 'is_active BOOLEAN' or 'gender CHAR(1)' as smell IDX-026?",
    "options": [
      "Low-cardinality columns have poor selectivity; query optimizers bypass the index in favor of sequential table scans, rendering the index useless overhead.",
      "Boolean columns cannot be stored in B+ trees.",
      "It causes an immediate 3NF violation.",
      "It causes a deadlock during transactions."
    ],
    "correctIndex": 0,
    "explanation": "IDX-026 flags low-selectivity indexes. If a column has only 2 distinct values (e.g. True/False), fetching records via secondary index incurs random I/O that is slower than a sequential scan, so the query optimizer ignores it."
  },
  {
    "id": "SMELL-Q43",
    "category": "indexing",
    "categoryTitle": "Physical Indexing Smells",
    "smellCode": "IDX-027",
    "topic": "Excessively Wide Index Smell",
    "difficulty": "Hard",
    "question": "What design penalty is flagged by smell IDX-027 (Excessively Wide Index)?",
    "options": [
      "Indexing long text/VARCHAR(500) columns or too many composite columns bloats B+ tree node sizes, reducing page fanout and increasing tree height and disk I/O.",
      "Preventing the use of SQL GROUP BY clauses.",
      "Violating BCNF normal form.",
      "Preventing foreign key cascading."
    ],
    "correctIndex": 0,
    "explanation": "IDX-027 flags wide indexes. B+ tree pages have fixed block sizes (typically 4KB-16KB). Wide keys drastically reduce the fanout (number of keys per page), resulting in deeper trees and more disk page reads."
  },
  {
    "id": "SMELL-Q44",
    "category": "indexing",
    "categoryTitle": "Physical Indexing Smells",
    "smellCode": "IDX-024",
    "topic": "Leftmost Prefix Matching in B+ Trees",
    "difficulty": "Medium",
    "question": "Given composite index IDX_ABC on (A, B, C), which WHERE clause CANNOT utilize this index efficiently?",
    "options": [
      "WHERE A = 10 AND B = 20",
      "WHERE A = 10",
      "WHERE B = 20 AND C = 30 (leading column A is omitted)",
      "WHERE A = 10 AND B = 20 AND C = 30"
    ],
    "correctIndex": 2,
    "explanation": "Because B+ trees sort keys in lexicographic order from left to right, queries that omit the leading column (A) cannot perform a tree range/equality search and require a full index scan."
  },
  {
    "id": "SMELL-Q45",
    "category": "indexing",
    "categoryTitle": "Physical Indexing Smells",
    "smellCode": "IDX-023",
    "topic": "Foreign Key Index Deadlock Prevention",
    "difficulty": "Hard",
    "question": "In PostgreSQL, MySQL InnoDB, and Oracle, why does a missing index on a child foreign key column often cause severe concurrency deadlocks?",
    "options": [
      "Parent table DELETE/UPDATE operations acquire a full table share lock on the unindexed child table instead of row-level locks.",
      "The database server crashes immediately.",
      "The transaction isolation level is automatically downgraded to Read Uncommitted.",
      "Child tuples are deleted asynchronously."
    ],
    "correctIndex": 0,
    "explanation": "Without an index on the child table's foreign key, verifying that no child references exist when deleting a parent row requires locking the entire child table, causing massive lock contention and deadlocks."
  },
  {
    "id": "SMELL-Q46",
    "category": "indexing",
    "categoryTitle": "Physical Indexing Smells",
    "smellCode": "IDX-026",
    "topic": "Partial / Filtered Indexes as Refactoring",
    "difficulty": "Hard",
    "question": "What is the recommended refactoring for an index on an 'order_status' column where 99% of rows are 'PROCESSED' and 1% are 'PENDING'?",
    "options": [
      "A Partial / Filtered Index: CREATE INDEX idx_pending ON Orders(order_id) WHERE order_status = 'PENDING';",
      "Drop all indexes on the table.",
      "Change order_status to an integer.",
      "Decompose into 10 separate tables."
    ],
    "correctIndex": 0,
    "explanation": "A Partial (Filtered) Index indexes only the small subset of rows of interest ('PENDING'), keeping the index lightweight, highly selective, and fast without indexing millions of unneeded 'PROCESSED' rows."
  },
  {
    "id": "SMELL-Q47",
    "category": "indexing",
    "categoryTitle": "Physical Indexing Smells",
    "smellCode": "IDX-025",
    "topic": "Clustered vs Secondary Index Smell",
    "difficulty": "Medium",
    "question": "In MySQL InnoDB, the Primary Key forms the Clustered Index. How does choosing a wide UUID string (CHAR(36)) instead of BIGINT AUTO_INCREMENT affect secondary indexes?",
    "options": [
      "Every secondary index leaf node must store the clustered key value; wide UUIDs severely bloat the size of all secondary indexes and cause page splits.",
      "UUIDs cannot be used as primary keys.",
      "Secondary indexes are disabled.",
      "The table automatically satisfies 3NF."
    ],
    "correctIndex": 0,
    "explanation": "In clustered storage engines like InnoDB, every secondary index entry stores the primary key value. Wide, non-sequential UUID primary keys bloat every secondary index and trigger frequent B+ tree page splits."
  },
  {
    "id": "SMELL-Q48",
    "category": "indexing",
    "categoryTitle": "Physical Indexing Smells",
    "smellCode": "IDX-027",
    "topic": "Covering Index Optimization",
    "difficulty": "Medium",
    "question": "How does creating a 'Covering Index' eliminate table lookup overhead?",
    "options": [
      "By including all columns referenced in the SELECT, WHERE, and JOIN clauses within the index, allowing the query to be satisfied entirely from the B+ tree.",
      "By encrypting the database files.",
      "By compressing all table rows into a zip file.",
      "By converting the table into Third Normal Form."
    ],
    "correctIndex": 0,
    "explanation": "A Covering Index contains all columns requested by a query. The engine retrieves the data directly from the index leaf nodes without performing a secondary lookup (bookmark lookup) to the main table data."
  },
  {
    "id": "SMELL-Q49",
    "category": "distributed",
    "categoryTitle": "Distributed & NoSQL Smells",
    "smellCode": "DIST-028",
    "topic": "Unbounded Document Growth Smell",
    "difficulty": "Medium",
    "question": "In document databases like MongoDB, embedding an array of comments inside a Post document: { post_id: 1, comments: [ ... ] } triggers smell DIST-028 (Unbounded Growth). Why?",
    "options": [
      "As comments grow indefinitely, the document exceeds the strict 16MB BSON document size limit and causes expensive disk relocations.",
      "MongoDB does not support arrays.",
      "Comments cannot have timestamps.",
      "It violates 2NF."
    ],
    "correctIndex": 0,
    "explanation": "DIST-028 flags unbounded document arrays. When child elements can grow indefinitely (e.g. comments, logs), embedding them risks breaching MongoDB's 16MB document boundary and causes severe memory fragmentation."
  },
  {
    "id": "SMELL-Q50",
    "category": "distributed",
    "categoryTitle": "Distributed & NoSQL Smells",
    "smellCode": "DIST-029",
    "topic": "Hot Partition Key / Shard Key Skew Smell",
    "difficulty": "Hard",
    "question": "Why does SchemaSense flag choosing a monotonically increasing timestamp or status column as a distributed shard key (Smell DIST-029)?",
    "options": [
      "All contemporary write traffic routes to the single partition holding the newest timestamp, creating a write hotspot while other cluster nodes sit idle.",
      "Timestamps are not unique.",
      "It violates ACID Durability.",
      "Distributed nodes cannot parse dates."
    ],
    "correctIndex": 0,
    "explanation": "DIST-029 flags Hot Partition Keys. When shard keys exhibit poor cardinality or monotonically increasing sequences (e.g., created_at), 100% of inserts hit the highest-range node, destroying horizontal scaling benefits."
  },
  {
    "id": "SMELL-Q51",
    "category": "distributed",
    "categoryTitle": "Distributed & NoSQL Smells",
    "smellCode": "DIST-030",
    "topic": "Cross-Partition Distributed Joins Smell",
    "difficulty": "Hard",
    "question": "In distributed architectures (CockroachDB, Citus, Spanner), what makes smell DIST-030 (Cross-Partition Joins) severe?",
    "options": [
      "Joining two large distributed tables that are not co-located by the same partition key requires massive network data shuffles (broadcast/scatter-gather) across the cluster.",
      "Distributed joins are mathematically forbidden.",
      "It turns relations into NoSQL key-value stores.",
      "It causes an automatic delete anomaly."
    ],
    "correctIndex": 0,
    "explanation": "DIST-030 flags cross-partition joins. When joined tables lack co-location by tenant or partition key, executing queries requires transmitting gigabytes of intermediate tuples across cluster network links."
  },
  {
    "id": "SMELL-Q52",
    "category": "distributed",
    "categoryTitle": "Distributed & NoSQL Smells",
    "smellCode": "DIST-031",
    "topic": "Over-Denormalization in NoSQL",
    "difficulty": "Medium",
    "question": "In a NoSQL database, duplicating complete user profiles inside every post, comment, and like document exhibits smell DIST-031. What is the main danger?",
    "options": [
      "Updating a user's name requires fan-out multi-document writes across thousands of records, causing multi-document update anomalies.",
      "It causes a BCNF failure.",
      "It forces MongoDB to switch to SQL.",
      "It prevents index creation."
    ],
    "correctIndex": 0,
    "explanation": "DIST-031 flags extreme over-denormalization in NoSQL. Replicating mutable parent entities across countless child records introduces catastrophic write amplification and distributed consistency hazards."
  },
  {
    "id": "SMELL-Q53",
    "category": "distributed",
    "categoryTitle": "Distributed & NoSQL Smells",
    "smellCode": "DIST-032",
    "topic": "Data Model Paradigm Mismatch Smell",
    "difficulty": "Medium",
    "question": "A developer attempts to model a social network with mutual friendships, deep recursive paths, and graph traversals inside a pure Key-Value store (Redis GET/SET). Which smell does SchemaSense identify?",
    "options": [
      "DIST-032 (Data Model Paradigm Mismatch), where a Graph Database (Neo4j) is required for efficient recursive graph traversal.",
      "NORM-015 (Partial Dependency).",
      "REL-001 (Missing Primary Key).",
      "IDX-024 (Redundant Prefix Index)."
    ],
    "correctIndex": 0,
    "explanation": "DIST-032 identifies paradigm mismatches. Forcing deeply interconnected networks into a key-value or document model requires exponential round-trip queries that would be solved by a native graph database."
  },
  {
    "id": "SMELL-Q54",
    "category": "distributed",
    "categoryTitle": "Distributed & NoSQL Smells",
    "smellCode": "DIST-033",
    "topic": "CAP / PACELC Architectural Mismatch Smell",
    "difficulty": "Hard",
    "question": "What architectural contradiction is flagged by smell DIST-033 (CAP Theorem Mismatch)?",
    "options": [
      "Demanding strict multi-row ACID transactions with zero latency on an AP (Available + Partition-Tolerant) distributed database that offers only eventual consistency.",
      "Using SQL on a single server.",
      "Using composite primary keys.",
      "Creating B+ tree indexes."
    ],
    "correctIndex": 0,
    "explanation": "DIST-033 flags CAP Theorem mismatches. Under Eric Brewer's CAP theorem, network partitions force systems to choose between Consistency (CP) and Availability (AP). Expecting immediate global linearizability on an AP system is an architectural defect."
  },
  {
    "id": "SMELL-Q55",
    "category": "distributed",
    "categoryTitle": "Distributed & NoSQL Smells",
    "smellCode": "DIST-028",
    "topic": "Refactoring Unbounded Document Growth",
    "difficulty": "Medium",
    "question": "What is the recommended design pattern to resolve smell DIST-028 (Unbounded Document Growth in Document DBs)?",
    "options": [
      "Use referencing / bucketing: store comments in a separate collection with a post_id foreign reference, or bucket comments into pages of 50.",
      "Increase server RAM to 1TB.",
      "Compress strings using Base64.",
      "Combine all documents into one single collection."
    ],
    "correctIndex": 0,
    "explanation": "The standard solution is the Hybrid Referencing or Bucketing Pattern: instead of embedding an unbounded array, store child records in their own collection with parent references, or bucket them into bounded documents."
  },
  {
    "id": "SMELL-Q56",
    "category": "distributed",
    "categoryTitle": "Distributed & NoSQL Smells",
    "smellCode": "DIST-029",
    "topic": "Hash Sharding as Shard Key Fix",
    "difficulty": "Hard",
    "question": "How does Hash-Based Sharding resolve smell DIST-029 (Hot Partition Key)?",
    "options": [
      "It passes the shard key through a cryptographic hash function (e.g. MD5/Murmur3) to uniformly distribute monotonically increasing writes across all cluster nodes.",
      "It stops accepting new write transactions.",
      "It replicates all records to every single node.",
      "It drops the primary key."
    ],
    "correctIndex": 0,
    "explanation": "Hash sharding applies a uniform hashing function to the key. Even if keys arrive in sequential order, their hash outputs are uniformly distributed across all shard ranges, preventing write hotspots."
  },
  {
    "id": "SMELL-Q57",
    "category": "diagnosis",
    "categoryTitle": "Schema Smell Diagnosis",
    "smellCode": "NORM-015",
    "topic": "Diagnose Schema: Student Course Grade",
    "difficulty": "Medium",
    "question": "Diagnose the following schema. What is the primary normalization smell detected by SchemaSense?",
    "code": "CREATE TABLE StudentCourseRegistration (\n    student_id INT,\n    course_code VARCHAR(10),\n    student_name VARCHAR(100),\n    course_credits INT,\n    final_grade CHAR(2),\n    PRIMARY KEY (student_id, course_code)\n);",
    "options": [
      "NORM-015: 2NF Partial Dependencies (student_name depends only on student_id, and course_credits depends only on course_code).",
      "REL-001: Missing Primary Key.",
      "NORM-014: Non-atomic multivalued attribute.",
      "IDX-025: Over-indexed table."
    ],
    "correctIndex": 0,
    "explanation": "The candidate key is (student_id, course_code). Non-prime attributes 'student_name' and 'course_credits' depend on proper subsets of the candidate key (student_id -> student_name, course_code -> course_credits), causing smell NORM-015 (2NF violation)."
  },
  {
    "id": "SMELL-Q58",
    "category": "diagnosis",
    "categoryTitle": "Schema Smell Diagnosis",
    "smellCode": "REL-007",
    "topic": "Diagnose Schema: Hospital Doctor Consultation",
    "difficulty": "Easy",
    "question": "Identify the primary relational smell in this table:",
    "code": "CREATE TABLE PatientConsultation (\n    consultation_id INT PRIMARY KEY,\n    patient_name VARCHAR(100) NOT NULL,\n    symptoms_list VARCHAR(500) -- Stores: 'Fever, Cough, Headache, Fatigue'\n);",
    "options": [
      "REL-007 / NORM-014: Multivalued Non-Atomic Attribute Smell storing delimited comma-separated symptoms in a single string.",
      "REL-005: Missing UNIQUE constraint.",
      "NORM-017: BCNF violation.",
      "IDX-026: Low-Selectivity Index."
    ],
    "correctIndex": 0,
    "explanation": "Storing comma-delimited symptoms violates relational atomicity (Smell REL-007 & NORM-014). It impedes querying patients with specific symptoms and prevents index utilization."
  },
  {
    "id": "SMELL-Q59",
    "category": "diagnosis",
    "categoryTitle": "Schema Smell Diagnosis",
    "smellCode": "NORM-016",
    "topic": "Diagnose Schema: Employee Office Branch",
    "difficulty": "Medium",
    "question": "Analyze the table below. What normalization smell is present?",
    "code": "CREATE TABLE Employee (\n    emp_id INT PRIMARY KEY,\n    emp_name VARCHAR(100) NOT NULL,\n    dept_code VARCHAR(10) NOT NULL,\n    dept_building VARCHAR(50),\n    dept_floor INT\n);",
    "options": [
      "NORM-016: 3NF Transitive Dependency (emp_id -> dept_code and dept_code -> dept_building, dept_floor).",
      "NORM-015: 2NF Partial Dependency.",
      "REL-001: Missing Primary Key.",
      "DIST-028: Unbounded Document Growth."
    ],
    "correctIndex": 0,
    "explanation": "The primary key is emp_id. dept_building and dept_floor depend on dept_code, which is a non-prime attribute. This forms a Transitive Dependency from emp_id, violating Third Normal Form (NORM-016)."
  },
  {
    "id": "SMELL-Q60",
    "category": "diagnosis",
    "categoryTitle": "Schema Smell Diagnosis",
    "smellCode": "IDX-024",
    "topic": "Diagnose Schema: E-Commerce Indexing",
    "difficulty": "Medium",
    "question": "Diagnose the indexing design in the following schema:",
    "code": "CREATE TABLE CustomerOrders (\n    order_id INT PRIMARY KEY,\n    customer_id INT NOT NULL,\n    store_id INT NOT NULL,\n    order_total DECIMAL(10,2)\n);\n\nCREATE INDEX idx_cust_store ON CustomerOrders (customer_id, store_id);\nCREATE INDEX idx_customer_only ON CustomerOrders (customer_id);",
    "options": [
      "Smell IDX-024: 'idx_customer_only' is a redundant left-prefix duplicate of composite index 'idx_cust_store'.",
      "Smell REL-001: Missing Primary Key.",
      "Smell NORM-018: 4NF MVD.",
      "Smell REL-010: Inconsistent Datatype."
    ],
    "correctIndex": 0,
    "explanation": "Because customer_id is the leading column in composite index idx_cust_store, the separate index idx_customer_only is completely redundant and should be removed to eliminate write overhead."
  },
  {
    "id": "SMELL-Q61",
    "category": "diagnosis",
    "categoryTitle": "Schema Smell Diagnosis",
    "smellCode": "REL-008",
    "topic": "Diagnose Schema: Student Skills",
    "difficulty": "Easy",
    "question": "What smell does SchemaSense identify in this schema?",
    "code": "CREATE TABLE CandidateProfile (\n    candidate_id INT PRIMARY KEY,\n    candidate_name VARCHAR(100),\n    skill_1 VARCHAR(50),\n    skill_2 VARCHAR(50),\n    skill_3 VARCHAR(50),\n    skill_4 VARCHAR(50)\n);",
    "options": [
      "REL-008: Repeating Groups / Enumerated Columns Anti-Pattern.",
      "REL-003: Orphaned Foreign Key.",
      "NORM-019: 5NF Join Dependency.",
      "IDX-027: Wide Index Smell."
    ],
    "correctIndex": 0,
    "explanation": "REL-008 flags numbered column attributes. It enforces an arbitrary limit (max 4 skills) and complicates searching (requiring WHERE skill_1 = 'SQL' OR skill_2 = 'SQL' OR ...). It should be a separate CandidateSkills table."
  },
  {
    "id": "SMELL-Q62",
    "category": "diagnosis",
    "categoryTitle": "Schema Smell Diagnosis",
    "smellCode": "REL-002",
    "topic": "Diagnose Schema: Missing Foreign Key Reference",
    "difficulty": "Medium",
    "question": "What critical smell is present between these two tables?",
    "code": "CREATE TABLE UniversityDepartment (\n    dept_id INT PRIMARY KEY,\n    dept_name VARCHAR(100)\n);\n\nCREATE TABLE Professor (\n    prof_id INT PRIMARY KEY,\n    prof_name VARCHAR(100),\n    dept_id INT -- Intended to link to UniversityDepartment\n);",
    "options": [
      "REL-002: Missing Foreign Key constraint on Professor.dept_id.",
      "REL-001: Missing Primary Key.",
      "ANOM-020: Insert Anomaly.",
      "DIST-030: Cross-partition join."
    ],
    "correctIndex": 0,
    "explanation": "Smell REL-002: Professor.dept_id references the primary key of UniversityDepartment but lacks the formal 'REFERENCES UniversityDepartment(dept_id)' clause, allowing orphaned professors with invalid departments."
  },
  {
    "id": "SMELL-Q63",
    "category": "diagnosis",
    "categoryTitle": "Schema Smell Diagnosis",
    "smellCode": "REL-009",
    "topic": "Diagnose Schema: Stored Computable Attribute",
    "difficulty": "Easy",
    "question": "Identify the smell in the Invoice table:",
    "code": "CREATE TABLE Invoice (\n    invoice_id INT PRIMARY KEY,\n    subtotal DECIMAL(10,2) NOT NULL,\n    tax_rate DECIMAL(4,2) NOT NULL,\n    tax_amount DECIMAL(10,2), -- subtotal * tax_rate\n    grand_total DECIMAL(10,2) -- subtotal + tax_amount\n);",
    "options": [
      "REL-009: Stored Derived / Calculable Attributes without automatic computed column synchronization.",
      "NORM-014: 1NF Multivalued violation.",
      "IDX-023: Missing Foreign Key Index.",
      "REL-005: Missing UNIQUE constraint."
    ],
    "correctIndex": 0,
    "explanation": "Smell REL-009: tax_amount and grand_total are mathematically derivable from subtotal and tax_rate. Storing them as raw writable columns risks data inconsistency if subtotal is updated without recalculating grand_total."
  },
  {
    "id": "SMELL-Q64",
    "category": "diagnosis",
    "categoryTitle": "Schema Smell Diagnosis",
    "smellCode": "IDX-023",
    "topic": "Diagnose Schema: Unindexed Foreign Key",
    "difficulty": "Medium",
    "question": "Why is the following schema flagged with smell IDX-023?",
    "code": "CREATE TABLE OrderItems (\n    item_id INT PRIMARY KEY,\n    order_id INT REFERENCES Orders(order_id),\n    product_id INT REFERENCES Products(product_id),\n    quantity INT\n);",
    "options": [
      "Foreign keys order_id and product_id lack secondary indexes, degrading join and delete cascade performance.",
      "item_id cannot be an integer.",
      "The table lacks a primary key.",
      "Foreign keys cannot reference two different tables."
    ],
    "correctIndex": 0,
    "explanation": "IDX-023 detects foreign key columns without an index. Here neither order_id nor product_id has an index, causing full table scans when parent Orders or Products rows are deleted or joined."
  },
  {
    "id": "SMELL-Q65",
    "category": "diagnosis",
    "categoryTitle": "Schema Smell Diagnosis",
    "smellCode": "REL-011",
    "topic": "Diagnose Schema: Sparse Table Anti-Pattern",
    "difficulty": "Hard",
    "question": "A table 'Vehicle' has 35 columns including: is_car, is_boat, is_plane, wing_span (NULL for cars/boats), propeller_type (NULL for cars), num_doors (NULL for planes/boats), draft_depth (NULL for cars/planes). What schema smell is this?",
    "options": [
      "REL-011: Excessive Nullable Columns / Sparse Table (Single Table Inheritance Anti-Pattern).",
      "NORM-017: BCNF violation.",
      "IDX-024: Duplicate Index.",
      "ANOM-022: Delete Anomaly."
    ],
    "correctIndex": 0,
    "explanation": "REL-011 flags sparse tables forcing disparate entity subtypes with mostly mutually exclusive attributes into a single massive relation, resulting in an abundance of NULL values and weak integrity constraints."
  }
];

if (typeof window !== 'undefined') {
    window.EXAM_MODULES = EXAM_MODULES;
    window.EXAM_QUESTION_BANK = EXAM_QUESTION_BANK;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EXAM_MODULES, EXAM_QUESTION_BANK };
}
