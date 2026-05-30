

USE iit_admin_db;

INSERT INTO roles (id, name) VALUES 
(1, 'ROLE_ADMIN'),
(2, 'ROLE_STAFF'),
(3, 'ROLE_FACULTY'),
(4, 'ROLE_STUDENT')
ON DUPLICATE KEY UPDATE name=VALUES(name);


INSERT INTO users (id, username, password, email, role_id, card_uid, created_at) VALUES
(1, 'admin', '$2a$10$8.uRq3GDG7aR.Wv/fP3A3ODpT0R4P7WupR2L/vQ5/5W5u1Xz1684G', 'admin@iit.ac.in', 1, 'CARD_ADMIN', NOW()),

(2, 'staff_rahul', '$2a$10$8.uRq3GDG7aR.Wv/fP3A3ODpT0R4P7WupR2L/vQ5/5W5u1Xz1684G', 'rahul.staff@iit.ac.in', 2, 'CARD_RAHUL', NOW()),
(3, 'staff_priya', '$2a$10$8.uRq3GDG7aR.Wv/fP3A3ODpT0R4P7WupR2L/vQ5/5W5u1Xz1684G', 'priya.staff@iit.ac.in', 2, 'CARD_PRIYA', NOW()),

(4, 'prof_sharma', '$2a$10$8.uRq3GDG7aR.Wv/fP3A3ODpT0R4P7WupR2L/vQ5/5W5u1Xz1684G', 'dsharma@cse.iit.ac.in', 3, 'CARD_SHARMA', NOW()),
(5, 'prof_sen', '$2a$10$8.uRq3GDG7aR.Wv/fP3A3ODpT0R4P7WupR2L/vQ5/5W5u1Xz1684G', 'asen@ee.iit.ac.in', 3, 'CARD_SEN', NOW()),
(6, 'prof_gupta', '$2a$10$8.uRq3GDG7aR.Wv/fP3A3ODpT0R4P7WupR2L/vQ5/5W5u1Xz1684G', 'rgupta@maths.iit.ac.in', 3, 'CARD_GUPTA', NOW()),

(7, 'stud_amit', '$2a$10$8.uRq3GDG7aR.Wv/fP3A3ODpT0R4P7WupR2L/vQ5/5W5u1Xz1684G', 'amit.singh@iit.ac.in', 4, NULL, NOW()),
(8, 'stud_neha', '$2a$10$8.uRq3GDG7aR.Wv/fP3A3ODpT0R4P7WupR2L/vQ5/5W5u1Xz1684G', 'neha.verma@iit.ac.in', 4, NULL, NOW()),
(9, 'stud_vikram', '$2a$10$8.uRq3GDG7aR.Wv/fP3A3ODpT0R4P7WupR2L/vQ5/5W5u1Xz1684G', 'vikram.roy@iit.ac.in', 4, NULL, NOW()),
(10, 'stud_sneha', '$2a$10$8.uRq3GDG7aR.Wv/fP3A3ODpT0R4P7WupR2L/vQ5/5W5u1Xz1684G', 'sneha.reddy@iit.ac.in', 4, NULL, NOW())
ON DUPLICATE KEY UPDATE password=VALUES(password);


INSERT INTO faculty (id, user_id, name, department, email, phone, designation, created_at) VALUES
(1, 4, 'Dr. Devendra Sharma', 'Computer Science & Engineering', 'dsharma@cse.iit.ac.in', '+91-9876543210', 'Professor', NOW() - INTERVAL 500 DAY),
(2, 5, 'Dr. Ananya Sen', 'Electrical Engineering', 'asen@ee.iit.ac.in', '+91-9876543211', 'Associate Professor', NOW() - INTERVAL 400 DAY),
(3, 6, 'Dr. Ramesh Gupta', 'Mathematics', 'rgupta@maths.iit.ac.in', '+91-9876543212', 'Assistant Professor', NOW() - INTERVAL 300 DAY)
ON DUPLICATE KEY UPDATE name=VALUES(name);


INSERT INTO students (id, user_id, roll_number, name, department, email, phone, semester, created_at) VALUES
(1, 7, 'IIT2023001', 'Amit Singh', 'Computer Science & Engineering', 'amit.singh@iit.ac.in', '+91-8888888881', 6, NOW() - INTERVAL 360 DAY),
(2, 8, 'IIT2023002', 'Neha Verma', 'Electrical Engineering', 'neha.verma@iit.ac.in', '+91-8888888882', 6, NOW() - INTERVAL 360 DAY),
(3, 9, 'IIT2024003', 'Vikram Roy', 'Computer Science & Engineering', 'vikram.roy@iit.ac.in', '+91-8888888883', 4, NOW() - INTERVAL 180 DAY),
(4, 10, 'IIT2022004', 'Sneha Reddy', 'Mathematics', 'sneha.reddy@iit.ac.in', '+91-8888888884', 8, NOW() - INTERVAL 540 DAY)
ON DUPLICATE KEY UPDATE name=VALUES(name);


INSERT INTO notices (id, title, content, created_by, attachment_path, is_pinned, expiry_date, created_at) VALUES
(1, 'End Semester Examination Schedule', 'The end semester examination schedule for all departments is out. Please check the department boards or portal for dates.', 1, NULL, TRUE, '2026-06-30', NOW() - INTERVAL 2 DAY),
(2, 'Annual Tech Fest - Nayan 2026', 'Registrations are open for Nayan 2026. Multiple technical and cultural events will be organized from 15th to 18th June.', 1, NULL, FALSE, '2026-06-18', NOW() - INTERVAL 5 DAY),
(3, 'Summer Internship Project Report Submission', 'All CSE 3rd year students must submit their internship report in PDF format before the deadline on 10th June 2026.', 4, NULL, TRUE, '2026-06-10', NOW() - INTERVAL 1 DAY),
(4, 'Hostel Room Cleanliness Drive', 'A cleanliness inspection will be carried out this Saturday across all hostels. Students are requested to cooperate with hostel staff.', 2, NULL, FALSE, '2026-05-30', NOW())
ON DUPLICATE KEY UPDATE title=VALUES(title);


INSERT INTO leave_requests (id, user_id, start_date, end_date, reason, status, attachment_path, remarks, actioned_by, created_at) VALUES
(1, 7, '2026-06-01', '2026-06-05', 'Attending sister\'s wedding ceremony in Lucknow.', 'APPROVED', NULL, 'Enjoy the wedding. Keep up with your study materials.', 1, NOW() - INTERVAL 10 DAY),
(2, 8, '2026-05-28', '2026-05-30', 'Suffering from viral fever. Doctor advised 3 days complete bed rest.', 'PENDING', NULL, NULL, NULL, NOW() - INTERVAL 1 DAY),
(3, 4, '2026-06-12', '2026-06-16', 'Visiting IIT Bombay for a joint research project seminar.', 'APPROVED', NULL, 'Duty leave approved. Alternative class arrangements updated.', 1, NOW() - INTERVAL 4 DAY),
(4, 9, '2026-05-20', '2026-05-22', 'Going home for personal work.', 'REJECTED', NULL, 'Midsem exams were active during this period. Request rejected.', 2, NOW() - INTERVAL 8 DAY)
ON DUPLICATE KEY UPDATE reason=VALUES(reason);

-- 7. INSERT COMPLAINTS
INSERT INTO complaints (id, student_id, title, description, category, status, assigned_to, created_at) VALUES
(1, 1, 'Wi-Fi Connection Issue in Hostel 3', 'The Wi-Fi router on the 2nd floor of Hostel 3 has been down for 3 days. Facing issues accessing online labs.', 'HOSTEL', 'IN_PROGRESS', 2, NOW() - INTERVAL 3 DAY),
(2, 2, 'Library AC Not Working', 'The air conditioning in the reading room of the main library is not working, causing extreme heat in the afternoon.', 'INFRASTRUCTURE', 'OPEN', NULL, NOW() - INTERVAL 1 DAY),
(3, 4, 'Refund of Duplicate Tuition Fee Payment', 'Accidentally paid the semester registration fee twice due to a portal timeout. Requesting refund for the duplicate transaction.', 'FINANCE', 'RESOLVED', 3, NOW() - INTERVAL 15 DAY),
(4, 1, 'Lab Computer Software Issue', 'The Python compilers on PC-12 and PC-14 in Lab 2 are showing environment path errors.', 'ACADEMIC', 'CLOSED', 2, NOW() - INTERVAL 5 DAY)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 9. INSERT ATTENDANCE RECORDS
INSERT INTO attendance (user_id, attendance_date, punch_in, punch_out, status, source, latitude, longitude, card_uid) VALUES
(2, CURDATE() - INTERVAL 1 DAY, CONCAT(CURDATE() - INTERVAL 1 DAY, ' 08:55:00'), CONCAT(CURDATE() - INTERVAL 1 DAY, ' 17:05:00'), 'PRESENT', 'BIOMETRIC', NULL, NULL, 'CARD_RAHUL'),
(4, CURDATE() - INTERVAL 1 DAY, CONCAT(CURDATE() - INTERVAL 1 DAY, ' 09:20:00'), CONCAT(CURDATE() - INTERVAL 1 DAY, ' 17:30:00'), 'LATE', 'MOBILE', 25.4298, 81.7713, NULL),
(2, CURDATE(), CONCAT(CURDATE(), ' 08:48:00'), NULL, 'PRESENT', 'BIOMETRIC', NULL, NULL, 'CARD_RAHUL'),
(5, CURDATE() - INTERVAL 1 DAY, CONCAT(CURDATE() - INTERVAL 1 DAY, ' 09:02:00'), CONCAT(CURDATE() - INTERVAL 1 DAY, ' 17:01:00'), 'PRESENT', 'BIOMETRIC', NULL, NULL, 'CARD_SEN')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 8. INSERT ACTIVITY LOGS
INSERT INTO activity_logs (id, user_id, action, details, ip_address, created_at) VALUES
(1, 1, 'SYSTEM_STARTUP', 'System services initialized successfully.', '127.0.0.1', NOW() - INTERVAL 30 DAY),
(2, 1, 'USER_LOGIN', 'Admin logged into the portal.', '192.168.1.10', NOW() - INTERVAL 2 DAY),
(3, 7, 'USER_LOGIN', 'Student Amit Singh logged into the portal.', '192.168.1.15', NOW() - INTERVAL 1 DAY),
(4, 4, 'USER_LOGIN', 'Professor Devendra Sharma logged into the portal.', '192.168.1.12', NOW() - INTERVAL 12 HOUR);
