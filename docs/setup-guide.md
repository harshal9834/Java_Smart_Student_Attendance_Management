# Smart Student Attendance Management System - Setup & Execution Guide

## 1. Prerequisites
- **Java**: Java 21 LTS (Amazon Corretto 21, Eclipse Temurin 21, or OpenJDK 21)
- **Node.js**: Node 20.x or 22.x LTS with npm
- **Database**: MySQL 8.0+ or Docker Desktop
- **Build Tool**: Apache Maven 3.9+

---

## 2. Quick Start with Docker Compose (Recommended)

To start the complete platform (MySQL 8.0, Spring Boot Backend, and React Frontend) with one command:

```bash
docker-compose up --build -d
```

- **Frontend UI**: http://localhost:3000
- **Spring Boot Backend**: http://localhost:8080
- **Swagger OpenAPI Docs**: http://localhost:8080/swagger-ui.html
- **MySQL Database**: `localhost:3306` (Database: `attendance_db`, user: `root`, password: `rootpassword`)

---

## 3. Manual Local Development Setup

### Step A: Start & Configure MySQL Database
1. Launch your MySQL server instance.
2. Create the attendance database:
   ```sql
   CREATE DATABASE attendance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. The Flyway database migrations in `backend/src/main/resources/db/migration/` (`V1__init_schema.sql` and `V2__sample_data.sql`) will automatically create all tables and initial seed data on Spring Boot startup.

### Step B: Start Java Spring Boot Backend
1. Open a terminal in `/backend`:
   ```bash
   cd backend
   ```
2. Run automated JUnit tests:
   ```bash
   mvn test
   ```
3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   Backend starts on port 8080.

### Step C: Start Frontend Application
1. Open a terminal in the project root:
   ```bash
   npm install
   npm run dev
   ```
2. Open your browser at http://localhost:3000.

---

## 4. Default Demonstration Accounts

The platform includes a convenient **Role Switcher** header in the live UI to test all roles immediately:

| Role | Email | Password | Scope & Permissions |
|------|-------|----------|---------------------|
| **Super Admin** | `superadmin@aite.edu` | `Admin@123` | Institution config, departments, academic years, audit logs, lock/unlock |
| **Admin** | `admin@aite.edu` | `Admin@123` | Manage classes, students, teachers, view analytics, broadcast defaulters |
| **Teacher** | `sarah.mitchell@aite.edu` | `Admin@123` | Assigned classes (CS301, CS304), take attendance, generate QR tokens, review disputes |
| **Student** | `alex.j@student.aite.edu` | `Admin@123` | View attendance percentage, class timetable, scan QR check-in, submit correction request |
