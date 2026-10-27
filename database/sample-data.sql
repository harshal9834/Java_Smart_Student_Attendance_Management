-- Standalone MySQL 8.x Sample Data for Local / Production Setup
-- Smart Student Attendance Management System

USE attendance_db;

-- 1. Institutional Base
INSERT INTO institutions (id, name, code, timezone, address) VALUES
('inst-1', 'Apex Institute of Technology & Engineering', 'AITE', 'Asia/Kolkata', 'Tech Innovation Park, Campus 1');

-- 2. Departments
INSERT INTO departments (id, institution_id, code, name, hod_name) VALUES
('dept-cse', 'inst-1', 'CSE', 'Computer Science & Engineering', 'Dr. Alan Turing'),
('dept-it', 'inst-1', 'IT', 'Information Technology', 'Dr. Grace Hopper'),
('dept-ece', 'inst-1', 'ECE', 'Electronics & Communication', 'Dr. Claude Shannon');

-- 3. Core Classes
INSERT INTO classes (id, institution_id, department_id, name, code, semester, academic_year) VALUES
('class-cs3', 'inst-1', 'dept-cse', 'B.Tech CSE - 3rd Year', 'CSE-3YR', 5, '2026-2027'),
('class-cs4', 'inst-1', 'dept-cse', 'B.Tech CSE - 4th Year', 'CSE-4YR', 7, '2026-2027'),
('class-it3', 'inst-1', 'dept-it', 'B.Tech IT - 3rd Year', 'IT-3YR', 5, '2026-2027'),
('class-ec3', 'inst-1', 'dept-ece', 'B.Tech ECE - 3rd Year', 'ECE-3YR', 5, '2026-2027');

-- 4. Sections
INSERT INTO sections (id, class_id, name) VALUES
('sec-cs3-a', 'class-cs3', 'Section A'),
('sec-cs3-b', 'class-cs3', 'Section B'),
('sec-it3-a', 'class-it3', 'Section A'),
('sec-ec3-a', 'class-ec3', 'Section A');

-- 5. Subjects
INSERT INTO subjects (id, department_id, code, name, credits, semester) VALUES
('sub-cs301', 'dept-cse', 'CS301', 'Database Management Systems', 4, 5),
('sub-cs302', 'dept-cse', 'CS302', 'Operating Systems', 4, 5),
('sub-cs303', 'dept-cse', 'CS303', 'Computer Networks', 4, 5),
('sub-cs304', 'dept-cse', 'CS304', 'Software Engineering', 3, 5);

-- 6. System Policies
INSERT INTO app_settings (setting_key, setting_value) VALUES
('minimum_threshold_percentage', '75.0'),
('count_late_as_attended', 'true'),
('late_weight', '1.0'),
('exclude_excused_from_denominator', 'true'),
('qr_token_validity_seconds', '45');
