# Smart Student Attendance Management System - REST API Specification

Version namespace: `/api/v1`

## 1. Authentication & Role Switcher
- `GET /api/v1/auth/me`: Returns active authenticated user, institution details, and policy.
- `POST /api/v1/auth/login`: Authenticates with email and password.
- `POST /api/v1/auth/switch-role`: Instant role preview switch (`SUPER_ADMIN`, `ADMIN`, `TEACHER`, `STUDENT`).
- `POST /api/v1/auth/logout`: Invalidates session.

## 2. Students API
- `GET /api/v1/students`: Lists students with filters (`search`, `departmentId`, `classId`, `sectionId`, `defaultersOnly`).
- `GET /api/v1/students/{id}`: Detailed student profile with calculated attendance rate and historical records.
- `POST /api/v1/students`: Registers a new student. Enforces unique roll number constraint.
- `PUT /api/v1/students/{id}`: Updates student details or active status.
- `POST /api/v1/students/bulk-import`: Parses and validates CSV student records with row-level error reporting.

## 3. Teachers API
- `GET /api/v1/teachers`: Lists faculty members and their assigned subject/class matrix.
- `POST /api/v1/teachers`: Registers a new teacher record.

## 4. Academics & Timetable
- `GET /api/v1/departments`: Lists departments and HODs.
- `GET /api/v1/classes`: Lists academic classes and semesters.
- `GET /api/v1/subjects`: Lists course subjects and credits.
- `GET /api/v1/timetable`: Returns weekly period schedules with room allocations.

## 5. Attendance Sessions & Engine
- `GET /api/v1/attendance/sessions`: Lists sessions by date, class, or subject.
- `POST /api/v1/attendance/sessions`: Creates an attendance session. Prevents duplicate sessions for identical period, date, class, and subject.
- `GET /api/v1/attendance/sessions/{id}`: Returns session metadata and all enrolled students with their status.
- `PUT /api/v1/attendance/sessions/{id}/records`: Transactionally saves attendance marks (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`).
- `POST /api/v1/attendance/sessions/{id}/submit`: Locks session to `SUBMITTED`. Rejects if any student remains `UNMARKED`.
- `POST /api/v1/attendance/sessions/{id}/reopen`: Unlocks session to `REOPENED`. Requires mandatory justification for audit trail.

## 6. Smart QR Code Check-In
- `POST /api/v1/attendance/qr-token`: Generates a rotating 45-second cryptographic token for a session.
- `POST /api/v1/attendance/qr-checkin`: Validates student enrollment and token freshness. Enforces single check-in rule.

## 7. Reports & Analytics
- `GET /api/v1/reports/class-attendance`: Class-wide attendance summary, class average, and compliance.
- `GET /api/v1/reports/student-attendance`: Student-specific audit report with all historical sessions.
- `GET /api/v1/reports/low-attendance`: Defaulter report for students below configured threshold with deficit analysis.
- `GET /api/v1/reports/analytics`: High-level aggregate metrics for dashboards and trend charts.

## 8. Disputes & Corrections
- `GET /api/v1/correction-requests`: Lists dispute requests.
- `POST /api/v1/correction-requests`: Student submits dispute with reason and requested status.
- `POST /api/v1/correction-requests/{id}/review`: Faculty/Admin approves or rejects. Automatically updates the underlying attendance record upon approval.

## 9. Audit Logs & System
- `GET /api/v1/audit-logs`: Immutable log of all administrative and attendance events.
- `GET /api/v1/settings`: Institutional attendance policy parameters.
- `PUT /api/v1/settings`: Updates threshold percentage, late penalty rules, and QR token validity.
- `GET /api/v1/system/status`: Health check and database engine status.
