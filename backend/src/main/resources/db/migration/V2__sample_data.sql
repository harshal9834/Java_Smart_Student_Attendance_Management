-- Flyway Database Migration: V2__sample_data.sql
-- Seed Initial Institution, Admin User, Classes, Subjects, Teachers, and Students

INSERT INTO institutions (id, name, code, timezone, address) VALUES
('inst-1', 'Apex Institute of Technology & Engineering', 'AITE', 'Asia/Kolkata', 'Tech Innovation Park, Campus 1');

-- Users: Passwords hashed with BCrypt ($2a$10$w... is 'Admin@123')
INSERT INTO users (id, institution_id, email, password_hash, full_name, role, is_active) VALUES
('usr-superadmin', 'inst-1', 'superadmin@aite.edu', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKT21Cfu', 'Dr. Christopher Vance', 'SUPER_ADMIN', TRUE),
('usr-admin', 'inst-1', 'admin@aite.edu', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKT21Cfu', 'Prof. Sarah Jenkins', 'ADMIN', TRUE),
('usr-teacher-1', 'inst-1', 'sarah.mitchell@aite.edu', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKT21Cfu', 'Dr. Sarah Mitchell', 'TEACHER', TRUE),
('usr-teacher-2', 'inst-1', 'david.miller@aite.edu', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKT21Cfu', 'Prof. David Miller', 'TEACHER', TRUE);

INSERT INTO departments (id, institution_id, code, name, hod_name) VALUES
('dept-cse', 'inst-1', 'CSE', 'Computer Science & Engineering', 'Dr. Alan Turing'),
('dept-it', 'inst-1', 'IT', 'Information Technology', 'Dr. Grace Hopper'),
('dept-ece', 'inst-1', 'ECE', 'Electronics & Communication', 'Dr. Claude Shannon');

INSERT INTO classes (id, institution_id, department_id, name, code, semester, academic_year) VALUES
('class-cs3', 'inst-1', 'dept-cse', 'B.Tech CSE - 3rd Year', 'CSE-3YR', 5, '2026-2027'),
('class-cs4', 'inst-1', 'dept-cse', 'B.Tech CSE - 4th Year', 'CSE-4YR', 7, '2026-2027'),
('class-it3', 'inst-1', 'dept-it', 'B.Tech IT - 3rd Year', 'IT-3YR', 5, '2026-2027'),
('class-ec3', 'inst-1', 'dept-ece', 'B.Tech ECE - 3rd Year', 'ECE-3YR', 5, '2026-2027');

INSERT INTO sections (id, class_id, name) VALUES
('sec-cs3-a', 'class-cs3', 'Section A'),
('sec-cs3-b', 'class-cs3', 'Section B'),
('sec-cs4-a', 'class-cs4', 'Section A'),
('sec-it3-a', 'class-it3', 'Section A'),
('sec-ec3-a', 'class-ec3', 'Section A');

INSERT INTO subjects (id, department_id, code, name, credits, semester) VALUES
('sub-cs301', 'dept-cse', 'CS301', 'Database Management Systems', 4, 5),
('sub-cs302', 'dept-cse', 'CS302', 'Operating Systems', 4, 5),
('sub-cs303', 'dept-cse', 'CS303', 'Computer Networks', 4, 5),
('sub-cs304', 'dept-cse', 'CS304', 'Software Engineering', 3, 5),
('sub-it301', 'dept-it', 'IT301', 'Web Technologies & Frameworks', 4, 5),
('sub-ec301', 'dept-ece', 'EC301', 'Digital Signal Processing', 4, 5);

INSERT INTO teachers (id, user_id, department_id, staff_id, full_name, email, contact_number, is_active) VALUES
('tch-1', 'usr-teacher-1', 'dept-cse', 'EMP-101', 'Dr. Sarah Mitchell', 'sarah.mitchell@aite.edu', '+1 555-0192', TRUE),
('tch-2', 'usr-teacher-2', 'dept-cse', 'EMP-102', 'Prof. David Miller', 'david.miller@aite.edu', '+1 555-0193', TRUE);

-- Seed core students in Class CS-3 Section A
INSERT INTO students (id, institution_id, department_id, class_id, section_id, roll_number, full_name, email, semester, academic_year, enrollment_date, is_active) VALUES
('std-1', 'inst-1', 'dept-cse', 'class-cs3', 'sec-cs3-a', 'CS23B101', 'Alex Johnson', 'alex.j@student.aite.edu', 5, '2026-2027', '2023-08-01', TRUE),
('std-2', 'inst-1', 'dept-cse', 'class-cs3', 'sec-cs3-a', 'CS23B102', 'Bethany Williams', 'bethany.w@student.aite.edu', 5, '2026-2027', '2023-08-01', TRUE),
('std-3', 'inst-1', 'dept-cse', 'class-cs3', 'sec-cs3-a', 'CS23B103', 'Carlos Gomez', 'carlos.g@student.aite.edu', 5, '2026-2027', '2023-08-01', TRUE),
('std-4', 'inst-1', 'dept-cse', 'class-cs3', 'sec-cs3-a', 'CS23B104', 'Divya Sharma', 'divya.s@student.aite.edu', 5, '2026-2027', '2023-08-01', TRUE),
('std-5', 'inst-1', 'dept-cse', 'class-cs3', 'sec-cs3-a', 'CS23B105', 'Ethan Hunt', 'ethan.h@student.aite.edu', 5, '2026-2027', '2023-08-01', TRUE),
('std-6', 'inst-1', 'dept-cse', 'class-cs3', 'sec-cs3-a', 'CS23B106', 'Fatima Al-Mansoor', 'fatima.m@student.aite.edu', 5, '2026-2027', '2023-08-01', TRUE),
('std-7', 'inst-1', 'dept-cse', 'class-cs3', 'sec-cs3-a', 'CS23B107', 'George Harrison', 'george.h@student.aite.edu', 5, '2026-2027', '2023-08-01', TRUE),
('std-8', 'inst-1', 'dept-cse', 'class-cs3', 'sec-cs3-a', 'CS23B108', 'Hannah Abbott', 'hannah.a@student.aite.edu', 5, '2026-2027', '2023-08-01', TRUE),
('std-9', 'inst-1', 'dept-cse', 'class-cs3', 'sec-cs3-a', 'CS23B109', 'Ishaan Patel', 'ishaan.p@student.aite.edu', 5, '2026-2027', '2023-08-01', TRUE),
('std-10', 'inst-1', 'dept-cse', 'class-cs3', 'sec-cs3-a', 'CS23B110', 'Julia Roberts', 'julia.r@student.aite.edu', 5, '2026-2027', '2023-08-01', TRUE),
('std-11', 'inst-1', 'dept-cse', 'class-cs3', 'sec-cs3-a', 'CS23B111', 'Kevin Durant', 'kevin.d@student.aite.edu', 5, '2026-2027', '2023-08-01', TRUE),
('std-12', 'inst-1', 'dept-cse', 'class-cs3', 'sec-cs3-a', 'CS23B112', 'Luna Lovegood', 'luna.l@student.aite.edu', 5, '2026-2027', '2023-08-01', TRUE),
('std-13', 'inst-1', 'dept-cse', 'class-cs3', 'sec-cs3-a', 'CS23B113', 'Marcus Aurelius', 'marcus.a@student.aite.edu', 5, '2026-2027', '2023-08-01', TRUE),
('std-14', 'inst-1', 'dept-cse', 'class-cs3', 'sec-cs3-a', 'CS23B114', 'Nina Simone', 'nina.s@student.aite.edu', 5, '2026-2027', '2023-08-01', TRUE),
('std-15', 'inst-1', 'dept-cse', 'class-cs3', 'sec-cs3-a', 'CS23B115', 'Oliver Twist', 'oliver.t@student.aite.edu', 5, '2026-2027', '2023-08-01', TRUE);

-- Timetable
INSERT INTO timetable_entries (id, class_id, section_id, subject_id, teacher_id, day_of_week, period_number, start_time, end_time, room_number) VALUES
('tt-1', 'class-cs3', 'sec-cs3-a', 'sub-cs301', 'tch-1', 1, 1, '09:00:00', '10:00:00', 'Room 301'),
('tt-2', 'class-cs3', 'sec-cs3-a', 'sub-cs302', 'tch-2', 1, 2, '10:15:00', '11:15:00', 'Room 301'),
('tt-3', 'class-cs3', 'sec-cs3-a', 'sub-cs303', 'tch-2', 1, 3, '11:30:00', '12:30:00', 'Room 302');

-- App settings
INSERT INTO app_settings (setting_key, setting_value) VALUES
('minimum_threshold_percentage', '75.0'),
('count_late_as_attended', 'true'),
('late_weight', '1.0'),
('exclude_excused_from_denominator', 'true'),
('qr_token_validity_seconds', '45');
