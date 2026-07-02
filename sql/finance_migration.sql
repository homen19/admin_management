-- ============================================================
-- FINANCE MODULE MIGRATION
-- Run this on top of the existing schema
-- ============================================================

USE iit_admin_db;

-- Insert ROLE_FINANCE (safe, ignores duplicate)
INSERT IGNORE INTO roles (name) VALUES ('ROLE_FINANCE');

-- ── 1. FEE PAYMENTS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fee_payments (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id    BIGINT NOT NULL,
    fee_type      VARCHAR(50)  NOT NULL DEFAULT 'TUITION',
                  -- TUITION | HOSTEL | EXAM | LIBRARY | OTHER
    academic_year VARCHAR(20)  NOT NULL,   -- e.g. "2024-25"
    semester      INT          NOT NULL,
    amount        DECIMAL(12,2) NOT NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'UNPAID',
                  -- PAID | UNPAID | PARTIAL
    paid_at       TIMESTAMP    NULL,
    receipt_number VARCHAR(50) NULL UNIQUE,
    remarks       TEXT         NULL,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX IF NOT EXISTS idx_fee_student   ON fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_status    ON fee_payments(status);
CREATE INDEX IF NOT EXISTS idx_fee_year      ON fee_payments(academic_year);

-- ── 2. SALARY RECORDS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS salary_records (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    month       INT          NOT NULL,   -- 1–12
    year        INT          NOT NULL,
    net_amount  DECIMAL(12,2) NOT NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
                -- PAID | PENDING
    paid_at     TIMESTAMP    NULL,
    remarks     TEXT         NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_salary_user_month_year (user_id, month, year)
) ENGINE=InnoDB;

CREATE INDEX IF NOT EXISTS idx_salary_user   ON salary_records(user_id);
CREATE INDEX IF NOT EXISTS idx_salary_period ON salary_records(year, month);
CREATE INDEX IF NOT EXISTS idx_salary_status ON salary_records(status);

-- ── 3. DEPARTMENT BUDGETS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS department_budgets (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    department_id    BIGINT        NOT NULL,
    academic_year    VARCHAR(20)   NOT NULL,
    allocated_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    remarks          TEXT          NULL,
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    UNIQUE KEY uq_budget_dept_year (department_id, academic_year)
) ENGINE=InnoDB;

CREATE INDEX IF NOT EXISTS idx_budget_year ON department_budgets(academic_year);

-- ── 4. EXPENSES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    department_id BIGINT        NOT NULL,
    category      VARCHAR(60)   NOT NULL DEFAULT 'OTHER',
                  -- EQUIPMENT | EVENTS | UTILITIES | SALARIES | MAINTENANCE | OTHER
    amount        DECIMAL(12,2) NOT NULL,
    description   TEXT          NOT NULL,
    expense_date  DATE          NOT NULL,
    logged_by     BIGINT        NULL,
    created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    FOREIGN KEY (logged_by)     REFERENCES users(id)       ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX IF NOT EXISTS idx_expense_dept ON expenses(department_id);
CREATE INDEX IF NOT EXISTS idx_expense_date ON expenses(expense_date);
