-- School and Class Attendance Migration Script
USE iit_admin_db;

-- 1. Create Schools Table
CREATE TABLE IF NOT EXISTS schools (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Create Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Create Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    department_id BIGINT NOT NULL,
    faculty_id BIGINT NULL,
    course_code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    semester INT NOT NULL,
    credits INT NOT NULL DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Create Syllabus Table
CREATE TABLE IF NOT EXISTS syllabus (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT UNIQUE NOT NULL,
    description TEXT,
    objectives TEXT,
    units JSON NULL, -- Will store unit array as JSON: [{"unit": 1, "title": "...", "content": "..."}]
    textbooks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Create Class Sessions Table (for scheduling individual lectures)
CREATE TABLE IF NOT EXISTS class_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    faculty_id BIGINT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    topic_covered VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Create Class Attendance Table (for recording attendance per student per class session)
CREATE TABLE IF NOT EXISTS class_attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    class_session_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PRESENT', -- PRESENT, ABSENT, LATE
    remarks VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_session_id) REFERENCES class_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY uq_session_student (class_session_id, student_id)
) ENGINE=InnoDB;

-- 7. Seed Initial Schools
INSERT INTO schools (name, code) VALUES 
('School of Engineering & Technology', 'SOET'),
('School of Basic Sciences', 'SOBS'),
('School of Management & Social Sciences', 'SOMS')
ON DUPLICATE KEY UPDATE code=VALUES(code);

-- 8. Seed Initial Departments
INSERT INTO departments (school_id, name, code) VALUES 
((SELECT id FROM schools WHERE code='SOET'), 'Computer Science & Engineering', 'CSE'),
((SELECT id FROM schools WHERE code='SOET'), 'Electrical Engineering', 'EE'),
((SELECT id FROM schools WHERE code='SOET'), 'Mechanical Engineering', 'ME'),
((SELECT id FROM schools WHERE code='SOET'), 'Civil Engineering', 'CE'),
((SELECT id FROM schools WHERE code='SOBS'), 'Mathematics', 'MATH'),
((SELECT id FROM schools WHERE code='SOBS'), 'Physics', 'PHYS')
ON DUPLICATE KEY UPDATE code=VALUES(code);

-- 9. Seed Initial Courses for CSE & Mathematics
INSERT INTO courses (department_id, course_code, title, semester, credits) VALUES
((SELECT id FROM departments WHERE code='CSE'), 'CS-301', 'Software Engineering', 6, 4),
((SELECT id FROM departments WHERE code='CSE'), 'CS-302', 'Compiler Design', 6, 4),
((SELECT id FROM departments WHERE code='CSE'), 'CS-201', 'Data Structures', 4, 4),
((SELECT id FROM departments WHERE code='MATH'), 'MA-401', 'Linear Algebra', 8, 3)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 10. Seed Initial Syllabi for the Courses
INSERT INTO syllabus (course_id, description, objectives, units, textbooks) VALUES
((SELECT id FROM courses WHERE course_code='CS-301'), 
 'Introduction to systematic, disciplined, quantifiable approach to development, operation, and maintenance of software.',
 'Understand Software Development Life Cycle (SDLC) models, requirements engineering, object-oriented software design, software testing, and agile practices.',
 '[{"unit": 1, "title": "Introduction to SDLC & Agile", "content": "Waterfall, Spiral, V-Model, and Scrum Framework. Agile software development principles and values."}, {"unit": 2, "title": "Requirements Engineering", "content": "Functional & non-functional requirements, SRS document creation, feasibility analysis."}, {"unit": 3, "title": "Software Design & Architecture", "content": "UML class diagrams, sequence diagrams, design patterns, MVC architecture."}, {"unit": 4, "title": "Testing & Maintenance", "content": "Unit testing, integration testing, system testing, regression testing. CI/CD pipelines."}]',
 '1. Pressman R. S., Software Engineering: A Practitioner''s Approach.
2. Sommerville I., Software Engineering.'),
((SELECT id FROM courses WHERE course_code='CS-201'), 
 'Fundamental computer science course covering standard methods for organizing and storing data in computer memory.',
 'Learn complexity analysis, list structures, stacks, queues, trees, and search algorithms.',
 '[{"unit": 1, "title": "Array & Linked Lists", "content": "Singly, doubly, and circular linked lists. Memory representations and operations."}, {"unit": 2, "title": "Stacks & Queues", "content": "LIFO and FIFO data structures, application in recursion, expression evaluation, and buffer management."}]',
 '1. Horowitz E., Sahni S., Fundamentals of Data Structures.
2. Cormen T. H., Introduction to Algorithms.')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- 11. Add department_id Column to students and faculty tables if not present
SET @student_dept_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='iit_admin_db' AND TABLE_NAME='students' AND COLUMN_NAME='department_id');
SET @query1 = IF(@student_dept_exists = 0, 'ALTER TABLE students ADD COLUMN department_id BIGINT NULL', 'SELECT "students.department_id already exists"');
PREPARE stmt1 FROM @query1;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

SET @faculty_dept_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='iit_admin_db' AND TABLE_NAME='faculty' AND COLUMN_NAME='department_id');
SET @query2 = IF(@faculty_dept_exists = 0, 'ALTER TABLE faculty ADD COLUMN department_id BIGINT NULL', 'SELECT "faculty.department_id already exists"');
PREPARE stmt2 FROM @query2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- 12. Migrate Existing Data: Map student/faculty textual department string to new department_id
UPDATE students s
INNER JOIN departments d ON s.department = d.name
SET s.department_id = d.id
WHERE s.department_id IS NULL;

UPDATE faculty f
INNER JOIN departments d ON f.department = d.name
SET f.department_id = d.id
WHERE f.department_id IS NULL;

-- If there are any leftovers (like non-mapped departments, create a fallback or default CSE mapping)
-- For example, fallback for students with departments like 'Electrical Engineering' to EE
UPDATE students s
SET s.department_id = (SELECT id FROM departments WHERE code='EE')
WHERE s.department_id IS NULL AND s.department = 'Electrical Engineering';

UPDATE faculty f
SET f.department_id = (SELECT id FROM departments WHERE code='EE')
WHERE f.department_id IS NULL AND f.department = 'Electrical Engineering';

-- 13. Add Foreign Key constraints and make department_id non-nullable once populated
-- (Note: If we run this script repeatedly, we check constraints first or use safe alter)
-- Check if foreign keys are already there or do a simple alter table.
-- First, default any remaining nulls to CSE department
UPDATE students SET department_id = (SELECT id FROM departments WHERE code='CSE') WHERE department_id IS NULL;
UPDATE faculty SET department_id = (SELECT id FROM departments WHERE code='CSE') WHERE department_id IS NULL;

ALTER TABLE students MODIFY COLUMN department_id BIGINT NOT NULL;
ALTER TABLE faculty MODIFY COLUMN department_id BIGINT NOT NULL;

-- Add constraints if not already present
-- We will use a safe trick to add FK constraints
SET @fk_students_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA='iit_admin_db' AND TABLE_NAME='students' AND COLUMN_NAME='department_id' AND REFERENCED_TABLE_NAME='departments');
SET @query3 = IF(@fk_students_exists = 0, 'ALTER TABLE students ADD CONSTRAINT fk_students_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT', 'SELECT "students department FK already exists"');
PREPARE stmt3 FROM @query3;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;

SET @fk_faculty_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA='iit_admin_db' AND TABLE_NAME='faculty' AND COLUMN_NAME='department_id' AND REFERENCED_TABLE_NAME='departments');
SET @query4 = IF(@fk_faculty_exists = 0, 'ALTER TABLE faculty ADD CONSTRAINT fk_faculty_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT', 'SELECT "faculty department FK already exists"');
PREPARE stmt4 FROM @query4;
EXECUTE stmt4;
DEALLOCATE PREPARE stmt4;

-- 14. Add faculty_id Column to courses table if not present (migration support)
SET @course_faculty_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='iit_admin_db' AND TABLE_NAME='courses' AND COLUMN_NAME='faculty_id');
SET @query5 = IF(@course_faculty_exists = 0, 'ALTER TABLE courses ADD COLUMN faculty_id BIGINT NULL', 'SELECT "courses.faculty_id already exists"');
PREPARE stmt5 FROM @query5;
EXECUTE stmt5;
DEALLOCATE PREPARE stmt5;

SET @fk_courses_faculty_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA='iit_admin_db' AND TABLE_NAME='courses' AND COLUMN_NAME='faculty_id' AND REFERENCED_TABLE_NAME='faculty');
SET @query6 = IF(@fk_courses_faculty_exists = 0, 'ALTER TABLE courses ADD CONSTRAINT fk_courses_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL', 'SELECT "courses faculty FK already exists"');
PREPARE stmt6 FROM @query6;
EXECUTE stmt6;
DEALLOCATE PREPARE stmt6;

-- 15. Drop old textual department column if present to avoid insert errors
SET @student_dept_old_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='iit_admin_db' AND TABLE_NAME='students' AND COLUMN_NAME='department');
SET @query7 = IF(@student_dept_old_exists = 1, 'ALTER TABLE students DROP COLUMN department', 'SELECT "students.department already dropped"');
PREPARE stmt7 FROM @query7;
EXECUTE stmt7;
DEALLOCATE PREPARE stmt7;

SET @faculty_dept_old_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='iit_admin_db' AND TABLE_NAME='faculty' AND COLUMN_NAME='department');
SET @query8 = IF(@faculty_dept_old_exists = 1, 'ALTER TABLE faculty DROP COLUMN department', 'SELECT "faculty.department already dropped"');
PREPARE stmt8 FROM @query8;
EXECUTE stmt8;
DEALLOCATE PREPARE stmt8;
