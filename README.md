# Smart Student Attendance Management System

An enterprise-grade, full-stack student attendance management platform built for modern educational institutions, colleges, and universities.

Features role-based access control, strict attendance calculation algorithms, multi-status verification (Present, Absent, Late, Excused), session state lifecycle (Draft, Submitted, Reopened, Locked), dynamic rotating QR code check-in with presence safeguards, dispute resolution workflows, audit logging, and reporting with RFC 4180 CSV export.

---

## 🚀 Key Capabilities

1. **Role-Based Access Control (RBAC)**:
   - **Super Administrator**: Overall institutional management, audit trail inspection, session unlocking, and policy configuration.
   - **Administrator**: Academic classes, sections, students, faculty, and institutional reports.
   - **Teacher / Faculty**: Assigned subjects and periods, manual attendance marking, dynamic QR code sessions, and dispute reviews.
   - **Student**: Personalized attendance percentage, subject breakdown, timetable, QR camera check-in, and dispute submission.

2. **Core Attendance Session Engine**:
   - Class, section, subject, date, and multi-period scheduling.
   - Real-time unmarked student counter and completion rate.
   - Single-click bulk marking ("Mark All Present", "Clear All").
   - Multi-status support: `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`.
   - Prevention of duplicate sessions and duplicate student records via `UNIQUE(attendance_session_id, student_id)`.
   - Finalization rule: Cannot submit with unmarked students.

3. **Smart QR Dynamic Check-In**:
   - Time-sensitive rotating cryptographic tokens (45-second validity).
   - Visual countdown timer and real-time live check-in event stream.
   - Backend validation of token freshness, student class enrollment, and single check-in enforcement.
   - Institutional safeguard notice regarding supervised verification.

4. **Tested Attendance Calculation Policy**:
   - Formula: $\text{Percentage} = (\text{Counted Attended} / \text{Eligible Recorded}) \times 100$.
   - Excused absence exemption from denominator.
   - Defaulter detection (< 75% threshold) with exact deficit calculation (classes needed to reach 75%).

5. **Dispute & Correction Workflow**:
   - Students dispute marked absences with justifications.
   - Faculty reviews and approves or rejects with comments.
   - Approval automatically adjusts the underlying attendance record and updates session aggregates with an immutable audit log entry.

6. **Full-Stack Architecture**:
   - **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide React.
   - **Backend**: Java 21 LTS, Spring Boot 3.3.4, Spring Security, Spring Data JPA, Hibernate.
   - **Database**: MySQL 8.x, Flyway database migrations (`V1__init_schema.sql`, `V2__sample_data.sql`), InnoDB engine.
   - **DevOps**: Docker Compose for single-command deployment.

---

## 🛠️ How to Run

### Method 1: Docker Compose (All Services)

```bash
docker-compose up --build -d
```

- **Frontend Web App**: http://localhost:3000
- **Spring Boot REST API**: http://localhost:8080
- **Swagger OpenAPI Docs**: http://localhost:8080/swagger-ui.html
- **MySQL Database**: `localhost:3306`

### Method 2: Local Development

1. **Database & Migrations**:
   Launch MySQL 8.0 and create the database:
   ```sql
   CREATE DATABASE attendance_db;
   ```

2. **Start Spring Boot Backend**:
   ```bash
   cd backend
   mvn clean test
   mvn spring-boot:run
   ```

3. **Start React Frontend**:
   ```bash
   npm install
   npm run dev
   ```

---

## 👥 Default Demo Accounts

Use the **Role Preview Switcher** in the top navigation bar to test all perspectives instantly:

| Role | Email | Password | Primary Scope |
|------|-------|----------|---------------|
| **Super Admin** | `superadmin@aite.edu` | `Admin@123` | System rules, audit trail, unlock |
| **Admin** | `admin@aite.edu` | `Admin@123` | Classes, rosters, analytics |
| **Faculty (Teacher)** | `sarah.mitchell@aite.edu` | `Admin@123` | CS301, CS304, Take attendance |
| **Student** | `alex.j@student.aite.edu` | `Admin@123` | CS23B101, Scan QR, dispute |
