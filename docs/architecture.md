# Smart Student Attendance Management System - System Architecture

## 1. High-Level Architecture Overview

The system is designed with a layered enterprise architecture:

```
[ React 19 + TypeScript SPA Client ]
                │
                ▼ REST API (JSON / Bearer JWT)
[ Spring Boot 3.3.x Application Server ]
 ├── Security: Spring Security + BCrypt + Role-Based Access Control
 ├── Controllers: REST endpoints under /api/v1/*
 ├── Services: Attendance Engine, Calculation Algorithm, Audit Logger
 ├── Persistence: Spring Data JPA + Hibernate
 └── Database Migrations: Flyway (V1 Schema, V2 Seed)
                │
                ▼ JDBC (InnoDB, Transactions, Unique Constraints)
[ MySQL 8.x Database Engine ]
```

---

## 2. Core Entities & Relational Schema

- **Institutions**: Multi-tenant institutional boundaries with timezone definitions.
- **Departments & Classes**: Academic hierarchy (e.g. Computer Science -> 3rd Year -> Section A).
- **Users & Roles**: `SUPER_ADMIN`, `ADMIN`, `TEACHER`, `STUDENT`.
- **Attendance Sessions**: Represents a specific lecture held by a teacher for a class, subject, period, and date.
- **Attendance Records**: Individual student status (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`).
  - **Critical Constraint**: `UNIQUE(attendance_session_id, student_id)` prevents double-counting or concurrent duplicate entries.
- **Correction Requests**: Formal dispute workflow where students request adjustments with evidence.
- **Audit Logs**: Immutable log recording actor, action, timestamp, old status, and new status.

---

## 3. Mathematical Attendance Calculation Engine

The formula executed across all reporting queries:

$$\text{Attendance Percentage} = \left(\frac{\text{Counted Attended Sessions}}{\text{Eligible Held Sessions}}\right) \times 100$$

### Configurable Institutional Rules
1. **PRESENT**: Contributes $1.0$ to attended count and $1$ to denominator.
2. **LATE**: If `countLateAsAttended = true`, contributes $1.0$ (or configured weight) to numerator, $1$ to denominator.
3. **ABSENT**: Contributes $0$ to numerator and $1$ to denominator.
4. **EXCUSED**: If `excludeExcusedFromDenominator = true`, excluded from denominator so approved medical leave does not penalize students.
5. **Zero Guard**: If denominator is $0$, returns $0.0\%$.
6. **Deficit Calculation**: Calculates how many consecutive attended sessions are required to reach the minimum $75\%$ threshold:
$$X = \left\lceil \frac{0.75 \times D - A}{1 - 0.75} \right\rceil$$

---

## 4. Smart QR Dynamic Tokens & Safeguards

- Software QR check-in generates short-lived, cryptographically randomized tokens with 45-second validity.
- The backend verifies:
  1. Token expiration timestamp.
  2. Student active enrollment in the matching class and section.
  3. Single check-in constraint per student per session.
- **Safeguard Disclaimer**: Rotating tokens mitigate static screenshot sharing and replay attacks.
