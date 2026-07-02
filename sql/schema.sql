

CREATE DATABASE IF NOT EXISTS iit_admin_db;
USE iit_admin_db;

-- 1. ROLES TABLE
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    role_id BIGINT NOT NULL,
    card_uid VARCHAR(100) UNIQUE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 3. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    roll_number VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20),
    semester INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. FACULTY TABLE
CREATE TABLE IF NOT EXISTS faculty (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20),
    designation VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. NOTICES TABLE
CREATE TABLE IF NOT EXISTS notices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_by BIGINT NOT NULL,
    attachment_path VARCHAR(255),
    is_pinned BOOLEAN DEFAULT FALSE,
    expiry_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. LEAVE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS leave_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    attachment_path VARCHAR(255),
    remarks TEXT,
    actioned_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (actioned_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 7. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- ACADEMIC, HOSTEL, INFRASTRUCTURE, FINANCE, OTHER
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, RESOLVED, CLOSED
    assigned_to BIGINT NULL, -- Staff user
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 8. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 9. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    attendance_date DATE NOT NULL,
    punch_in TIMESTAMP NULL,
    punch_out TIMESTAMP NULL,
    status VARCHAR(50) DEFAULT 'PRESENT',
    source VARCHAR(50) NOT NULL,
    latitude DOUBLE NULL,
    longitude DOUBLE NULL,
    card_uid VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_date (user_id, attendance_date)
) ENGINE=InnoDB;


-- 10. LIBRARIANS TABLE
CREATE TABLE IF NOT EXISTS librarians (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. BOOKS TABLE
CREATE TABLE IF NOT EXISTS books (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    isbn VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    publisher VARCHAR(255),
    copies_total INT NOT NULL DEFAULT 1,
    copies_available INT NOT NULL DEFAULT 1,
    location_shelf VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 12. BOOK ISSUES TABLE
CREATE TABLE IF NOT EXISTS book_issues (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    book_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE NULL,
    status VARCHAR(50) DEFAULT 'ISSUED', -- ISSUED, RETURNED, OVERDUE
    fine_amount DECIMAL(10,2) DEFAULT 0.00,
    fine_paid BOOLEAN DEFAULT TRUE,
    issued_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 13. INVENTORY ITEMS TABLE
CREATE TABLE IF NOT EXISTS inventory_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    location VARCHAR(100),
    total_quantity INT NOT NULL DEFAULT 0,
    available_quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 14. INVENTORY ALLOCATIONS TABLE
CREATE TABLE IF NOT EXISTS inventory_allocations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT NOT NULL,
    allocated_to_id BIGINT NOT NULL,
    allocated_by_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    allocation_date DATE NOT NULL,
    expected_return_date DATE,
    actual_return_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ALLOCATED',
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
    FOREIGN KEY (allocated_to_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (allocated_by_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- ==========================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ==========================================

CREATE INDEX idx_students_roll ON students(roll_number);
CREATE INDEX idx_students_dept ON students(department);
CREATE INDEX idx_faculty_dept ON faculty(department);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_category ON complaints(category);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_notices_pinned_expiry ON notices(is_pinned, expiry_date);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_attendance_user_date ON attendance(user_id, attendance_date);


-- ==========================================
-- STORED PROCEDURES FOR ANALYTICS
-- ==========================================

DELIMITER //

-- 1. Department-wise Student Count
DROP PROCEDURE IF EXISTS GetDepartmentStudentCount //
CREATE PROCEDURE GetDepartmentStudentCount()
BEGIN
    SELECT department, COUNT(*) AS student_count
    FROM students
    GROUP BY department
    ORDER BY student_count DESC;
END //

-- 2. Monthly Leave Statistics
DROP PROCEDURE IF EXISTS GetMonthlyLeaveStats //
CREATE PROCEDURE GetMonthlyLeaveStats()
BEGIN
    SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) AS approved_count,
        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected_count,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending_count,
        COUNT(*) AS total_requests
    FROM leave_requests
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month DESC;
END //

-- 3. Complaint Category Statistics
DROP PROCEDURE IF EXISTS GetComplaintCategoryStats //
CREATE PROCEDURE GetComplaintCategoryStats()
BEGIN
    SELECT 
        category,
        COUNT(*) AS total_complaints,
        SUM(CASE WHEN status = 'CLOSED' OR status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolved_complaints,
        ROUND((SUM(CASE WHEN status = 'CLOSED' OR status = 'RESOLVED' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) AS resolution_rate
    FROM complaints
    GROUP BY category
    ORDER BY total_complaints DESC;
END //

-- 4. Student Rank in Department by Registration (using window functions inside a SP)
DROP PROCEDURE IF EXISTS GetStudentRegistrationOrder //
CREATE PROCEDURE GetStudentRegistrationOrder()
BEGIN
    SELECT 
        id,
        roll_number,
        name,
        department,
        semester,
        ROW_NUMBER() OVER (PARTITION BY department ORDER BY created_at ASC) AS registration_rank
    FROM students;
END //

DELIMITER ;


-- ==========================================
-- TRIGGERS FOR AUDIT LOGGING
-- ==========================================

DELIMITER //

DROP TRIGGER IF EXISTS after_notice_insert //
CREATE TRIGGER after_notice_insert
AFTER INSERT ON notices
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (user_id, action, details, ip_address)
    VALUES (NEW.created_by, 'CREATE_NOTICE', CONCAT('New notice created: ', NEW.title), 'SYSTEM');
END //

DROP TRIGGER IF EXISTS after_complaint_insert //
CREATE TRIGGER after_complaint_insert
AFTER INSERT ON complaints
FOR EACH ROW
BEGIN
    -- Resolve student's user ID for logging
    DECLARE student_user_id BIGINT;
    SELECT user_id INTO student_user_id FROM students WHERE id = NEW.student_id;
    
    INSERT INTO activity_logs (user_id, action, details, ip_address)
    VALUES (student_user_id, 'SUBMIT_COMPLAINT', CONCAT('Complaint raised: ', NEW.title, ' [Category: ', NEW.category, ']'), 'SYSTEM');
END //

DELIMITER ;
