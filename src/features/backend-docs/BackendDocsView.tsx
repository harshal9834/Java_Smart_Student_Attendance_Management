import React, { useState } from 'react';
import {
  Code2,
  Database,
  Server,
  FileCode,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  Layers,
  BookOpen,
  GitFork,
  Boxes,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const BackendDocsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    | 'OOP_EXPLANATION'
    | 'ABSTRACT_PERSON'
    | 'STUDENT_SUBCLASS'
    | 'TEACHER_SUBCLASS'
    | 'BASE_ENTITY'
    | 'TEMPLATE_PROCESSOR'
    | 'STRATEGY_INTERFACE'
    | 'OOP_TEST'
    | 'FLYWAY_SCHEMA'
    | 'DOCKER'
    | 'POM'
  >('OOP_EXPLANATION');

  const [copied, setCopied] = useState(false);

  const codeSnippets: Record<string, { title: string; filename: string; lang: string; content: string; description: string }> = {
    OOP_EXPLANATION: {
      title: 'Object-Oriented Architecture Overview (Inheritance & Abstraction)',
      filename: 'docs/oop-architecture.md',
      lang: 'markdown',
      description: 'Comprehensive explanation of how Inheritance, Abstraction, and Polymorphism are implemented.',
      content: `# Java OOP Concepts in Smart Attendance Platform

## 1. INHERITANCE (is-a relationship & code reuse)
Inheritance is implemented across multiple layers of the application:

### A. Entity Domain Hierarchy
- **BaseEntity** (\`@MappedSuperclass\`):
  Defines universal persistence attributes (\`id\`, \`createdAt\`, \`updatedAt\`, \`equals()\`, \`hashCode()\`).
- **AbstractAcademicPerson extends BaseEntity**:
  Inherits all \`BaseEntity\` identity traits and introduces common person state (\`fullName\`, \`email\`, \`contactNumber\`, \`departmentId\`, \`isActive\`).
- **Student extends AbstractAcademicPerson**:
  Inherits all \`BaseEntity\` and \`AbstractAcademicPerson\` fields; introduces student-specific state (\`rollNumber\`, \`classId\`, \`sectionId\`, \`semester\`, \`enrollmentDate\`).
- **Teacher extends AbstractAcademicPerson**:
  Inherits all base state; introduces faculty-specific state (\`staffId\`, \`assignedSubjectIds\`).

### B. Template Method Invariant Workflow
- **AbstractAttendanceProcessor**:
  Defines the immutable template method \`processCheckIn(CheckInRequest request)\` with invariant pre-validation and post-audit.
- **ManualAttendanceProcessor extends AbstractAttendanceProcessor**:
  Overrides \`validateCheckInRules()\` to enforce teacher identity.
- **QrCodeAttendanceProcessor extends AbstractAttendanceProcessor**:
  Overrides \`validateCheckInRules()\` to verify cryptographic token freshness.

---

## 2. ABSTRACTION (Contract over Implementation)
Abstraction hides complex calculation details behind simple, stable contracts:

### A. Strategy Pattern Interface: \`AttendancePolicyStrategy\`
Defines the abstract contract for institutional attendance calculations:
\`\`\`java
public interface AttendancePolicyStrategy {
    double calculateNumerator(List<Status> statuses, double lateWeight);
    int calculateDenominator(List<Status> statuses, boolean excludeExcused);
    double getMinimumThresholdPercentage();
    String getPolicyName();
}
\`\`\`
- **StandardAttendancePolicy implements AttendancePolicyStrategy**:
  Implements 75% threshold, counts LATE as attended, excludes EXCUSED from denominator.
- **StrictAttendancePolicy implements AttendancePolicyStrategy**:
  Implements 80% threshold, gives 0 credit for LATE, keeps EXCUSED in denominator.

### B. Abstract Methods in Base Classes
\`AbstractAcademicPerson\` enforces two abstract methods:
\`\`\`java
public abstract String getInstitutionalIdentifier(); // Student -> Roll No, Teacher -> Staff ID
public abstract String getRoleName();                // Student -> "STUDENT", Teacher -> "TEACHER"
\`\`\`
This enables **Polymorphism**: The caller interacts with \`AbstractAcademicPerson\` without knowing or caring whether it is a \`Student\` or \`Teacher\`.`
    },
    ABSTRACT_PERSON: {
      title: 'Abstract Class Contract: AbstractAcademicPerson.java',
      filename: 'backend/src/main/java/com/example/smartattendance/model/AbstractAcademicPerson.java',
      lang: 'java',
      description: 'Demonstrates both Inheritance (extends BaseEntity) and Abstraction (declares abstract methods).',
      content: `package com.example.smartattendance.model;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;

/**
 * AbstractAcademicPerson demonstrates both INHERITANCE and ABSTRACTION:
 * 1. INHERITANCE: Extends BaseEntity to reuse identifier and audit timestamps.
 * 2. ABSTRACTION: Declares abstract methods (getInstitutionalIdentifier, getRoleName)
 *    that enforce an architectural contract on derived classes (Student, Teacher).
 */
@MappedSuperclass
public abstract class AbstractAcademicPerson extends BaseEntity {

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "contact_number")
    private String contactNumber;

    @Column(name = "department_id", nullable = false)
    private String departmentId;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    public AbstractAcademicPerson() {
        super();
    }

    public AbstractAcademicPerson(String id, String fullName, String email, String departmentId) {
        super(id);
        this.fullName = fullName;
        this.email = email;
        this.departmentId = departmentId;
        this.isActive = true;
    }

    // ==========================================
    // ABSTRACT METHODS (ABSTRACTION CONTRACT)
    // ==========================================

    /**
     * Subclasses must provide their unique institutional identifier.
     * E.g., Student returns Roll Number (CS23B101), Teacher returns Staff ID (EMP-101).
     */
    public abstract String getInstitutionalIdentifier();

    /**
     * Subclasses must declare their role designation.
     */
    public abstract String getRoleName();

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getDepartmentId() { return departmentId; }
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}`
    },
    STUDENT_SUBCLASS: {
      title: 'Inheritance Implementation: Student.java',
      filename: 'backend/src/main/java/com/example/smartattendance/model/Student.java',
      lang: 'java',
      description: 'Extends AbstractAcademicPerson (Inheritance) and implements its abstract methods.',
      content: `package com.example.smartattendance.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDate;

/**
 * Student demonstrates INHERITANCE:
 * Inherits all common person fields (fullName, email, contactNumber, departmentId)
 * and entity identity (id, createdAt, updatedAt) from AbstractAcademicPerson -> BaseEntity.
 */
@Entity
@Table(name = "students")
public class Student extends AbstractAcademicPerson {

    @Column(name = "roll_number", nullable = false, unique = true)
    private String rollNumber;

    @Column(name = "class_id", nullable = false)
    private String classId;

    @Column(name = "section_id", nullable = false)
    private String sectionId;

    @Column(name = "semester", nullable = false)
    private int semester;

    @Column(name = "academic_year", nullable = false)
    private String academicYear;

    @Column(name = "enrollment_date", nullable = false)
    private LocalDate enrollmentDate;

    public Student() {
        super();
    }

    public Student(String id, String rollNumber, String fullName, String email, String departmentId, String classId, String sectionId, int semester) {
        super(id, fullName, email, departmentId);
        this.rollNumber = rollNumber;
        this.classId = classId;
        this.sectionId = sectionId;
        this.semester = semester;
        this.academicYear = "2026-2027";
        this.enrollmentDate = LocalDate.now();
    }

    // ==========================================
    // IMPLEMENTATION OF ABSTRACT CONTRACT
    // ==========================================

    @Override
    public String getInstitutionalIdentifier() {
        return this.rollNumber;
    }

    @Override
    public String getRoleName() {
        return "STUDENT";
    }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
    public String getClassId() { return classId; }
    public void setClassId(String classId) { this.classId = classId; }
    public String getSectionId() { return sectionId; }
    public void setSectionId(String sectionId) { this.sectionId = sectionId; }
    public int getSemester() { return semester; }
    public void setSemester(int semester) { this.semester = semester; }
    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
    public LocalDate getEnrollmentDate() { return enrollmentDate; }
    public void setEnrollmentDate(LocalDate enrollmentDate) { this.enrollmentDate = enrollmentDate; }
}`
    },
    TEACHER_SUBCLASS: {
      title: 'Inheritance Implementation: Teacher.java',
      filename: 'backend/src/main/java/com/example/smartattendance/model/Teacher.java',
      lang: 'java',
      description: 'Extends AbstractAcademicPerson (Inheritance) and fulfills abstraction contract.',
      content: `package com.example.smartattendance.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * Teacher demonstrates INHERITANCE:
 * Extends AbstractAcademicPerson to reuse core identity, personal contact, and department attributes.
 */
@Entity
@Table(name = "teachers")
public class Teacher extends AbstractAcademicPerson {

    @Column(name = "staff_id", nullable = false, unique = true)
    private String staffId;

    public Teacher() {
        super();
    }

    public Teacher(String id, String staffId, String fullName, String email, String departmentId) {
        super(id, fullName, email, departmentId);
        this.staffId = staffId;
    }

    @Override
    public String getInstitutionalIdentifier() {
        return this.staffId;
    }

    @Override
    public String getRoleName() {
        return "TEACHER";
    }

    public String getStaffId() { return staffId; }
    public void setStaffId(String staffId) { this.staffId = staffId; }
}`
    },
    BASE_ENTITY: {
      title: 'Superclass: BaseEntity.java',
      filename: 'backend/src/main/java/com/example/smartattendance/model/BaseEntity.java',
      lang: 'java',
      description: 'The root MappedSuperclass providing inherited ID, createdAt, and updatedAt to all models.',
      content: `package com.example.smartattendance.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * BaseEntity demonstrates INHERITANCE using JPA @MappedSuperclass.
 * All persistent domain entities inherit standard identity and audit timestamps.
 */
@MappedSuperclass
public abstract class BaseEntity {

    @Id
    @Column(name = "id", length = 36, nullable = false, updatable = false)
    private String id;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public BaseEntity() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public BaseEntity(String id) {
        this();
        this.id = id;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}`
    },
    TEMPLATE_PROCESSOR: {
      title: 'Template Method Pattern: AbstractAttendanceProcessor.java',
      filename: 'backend/src/main/java/com/example/smartattendance/service/processor/AbstractAttendanceProcessor.java',
      lang: 'java',
      description: 'Demonstrates Abstraction + Inheritance via the GoF Template Method Pattern.',
      content: `package com.example.smartattendance.service.processor;

import java.time.LocalDateTime;

/**
 * Demonstrates the classic GoF Template Method Pattern utilizing:
 * 1. ABSTRACTION: Invariant skeleton algorithm defined in an abstract class.
 * 2. INHERITANCE: Specific check-in mechanisms override primitive hooks.
 */
public abstract class AbstractAttendanceProcessor {

    public enum CheckInMethod { MANUAL, QR_CODE, CORRECTION }

    public record CheckInRequest(
        String sessionId, String studentId, String studentRoll,
        String status, String qrToken, String remarks, String markedBy
    ) {}

    public record ProcessedResult(
        String recordId, String sessionId, String studentId,
        String status, CheckInMethod method, LocalDateTime timestamp,
        boolean success, String message
    ) {}

    /**
     * TEMPLATE METHOD (final: subclasses cannot alter the invariant flow).
     */
    public final ProcessedResult processCheckIn(CheckInRequest request) {
        if (request.sessionId() == null || request.studentId() == null) {
            throw new IllegalArgumentException("Session ID and Student ID are mandatory.");
        }

        // Subclass-specific validation hook (ABSTRACTION)
        validateCheckInRules(request);

        // Determine method type (ABSTRACTION)
        CheckInMethod method = getMethodType();

        String recordId = "rec-" + request.sessionId() + "-" + request.studentId();
        return new ProcessedResult(
            recordId, request.sessionId(), request.studentId(),
            request.status() != null ? request.status() : "PRESENT",
            method, LocalDateTime.now(), true,
            "Attendance successfully registered via " + method
        );
    }

    protected abstract void validateCheckInRules(CheckInRequest request);
    protected abstract CheckInMethod getMethodType();
}`
    },
    STRATEGY_INTERFACE: {
      title: 'Strategy Pattern: AttendancePolicyStrategy.java',
      filename: 'backend/src/main/java/com/example/smartattendance/service/policy/AttendancePolicyStrategy.java',
      lang: 'java',
      description: 'Pure interface Abstraction allowing dynamic switching between Standard (75%) and Strict (80%) rules.',
      content: `package com.example.smartattendance.service.policy;

import com.example.smartattendance.service.AttendanceCalculationService.Status;
import java.util.List;

/**
 * Demonstrates ABSTRACTION:
 * Interface defining calculation contracts. High-level services depend on this
 * abstraction rather than concrete details (Dependency Inversion Principle).
 */
public interface AttendancePolicyStrategy {

    double calculateNumerator(List<Status> statuses, double lateWeight);

    int calculateDenominator(List<Status> statuses, boolean excludeExcused);

    double getMinimumThresholdPercentage();

    String getPolicyName();
}`
    },
    OOP_TEST: {
      title: 'JUnit 5 Verification: OopInheritanceAndAbstractionTest.java',
      filename: 'backend/src/test/java/com/example/smartattendance/oop/OopInheritanceAndAbstractionTest.java',
      lang: 'java',
      description: 'Automated tests proving Polymorphism, Inheritance field reuse, and Strategy Pattern dispatch.',
      content: `package com.example.smartattendance.oop;

import com.example.smartattendance.model.AbstractAcademicPerson;
import com.example.smartattendance.model.Student;
import com.example.smartattendance.model.Teacher;
import com.example.smartattendance.service.AttendanceCalculationService.Status;
import com.example.smartattendance.service.policy.AttendancePolicyStrategy;
import com.example.smartattendance.service.policy.StandardAttendancePolicy;
import com.example.smartattendance.service.policy.StrictAttendancePolicy;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class OopInheritanceAndAbstractionTest {

    @Test
    @DisplayName("Inheritance & Polymorphism: Treat Student and Teacher via AbstractAcademicPerson base type")
    void testInheritanceAndPolymorphicDispatch() {
        // Polymorphic references to base abstract class
        AbstractAcademicPerson student = new Student(
            "std-1", "CS23B101", "Alex Johnson", "alex@aite.edu", "dept-cse", "class-cs3", "sec-cs3-a", 5
        );
        AbstractAcademicPerson teacher = new Teacher(
            "tch-1", "EMP-101", "Dr. Sarah Mitchell", "sarah@aite.edu", "dept-cse"
        );

        // 1. Inherited fields from BaseEntity
        assertEquals("std-1", student.getId());
        assertEquals("tch-1", teacher.getId());

        // 2. Inherited fields from AbstractAcademicPerson
        assertEquals("Alex Johnson", student.getFullName());
        assertEquals("Dr. Sarah Mitchell", teacher.getFullName());

        // 3. Polymorphic execution of abstract methods
        assertEquals("CS23B101", student.getInstitutionalIdentifier());
        assertEquals("STUDENT", student.getRoleName());
        assertEquals("EMP-101", teacher.getInstitutionalIdentifier());
        assertEquals("TEACHER", teacher.getRoleName());
    }

    @Test
    @DisplayName("Abstraction via Strategy Pattern: Polymorphic behavior across AttendancePolicyStrategy implementations")
    void testStrategyPatternAbstraction() {
        AttendancePolicyStrategy standardPolicy = new StandardAttendancePolicy();
        assertEquals(75.0, standardPolicy.getMinimumThresholdPercentage());

        AttendancePolicyStrategy strictPolicy = new StrictAttendancePolicy();
        assertEquals(80.0, strictPolicy.getMinimumThresholdPercentage());

        List<Status> statuses = List.of(
            Status.PRESENT, Status.PRESENT, Status.PRESENT, Status.PRESENT,
            Status.PRESENT, Status.PRESENT, Status.PRESENT, Status.PRESENT,
            Status.LATE, Status.ABSENT
        );

        // Standard Strategy: Late receives 1.0 credit -> 9 attended
        assertEquals(9.0, standardPolicy.calculateNumerator(statuses, 1.0));

        // Strict Strategy: Late receives 0 credit -> 8 attended
        assertEquals(8.0, strictPolicy.calculateNumerator(statuses, 1.0));
    }
}`
    },
    FLYWAY_SCHEMA: {
      title: 'Flyway MySQL Schema Migration (V1)',
      filename: 'backend/src/main/resources/db/migration/V1__init_schema.sql',
      lang: 'sql',
      description: 'Normalized MySQL tables with unique constraints, indexes, and audit logs.',
      content: `-- Flyway Database Migration: V1__init_schema.sql
CREATE TABLE attendance_sessions (
    id VARCHAR(36) PRIMARY KEY,
    class_id VARCHAR(36) NOT NULL,
    section_id VARCHAR(36) NOT NULL,
    subject_id VARCHAR(36) NOT NULL,
    teacher_id VARCHAR(36) NOT NULL,
    session_date DATE NOT NULL,
    period_number INT NOT NULL,
    state VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_session_unique (class_id, section_id, subject_id, session_date, period_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE attendance_records (
    id VARCHAR(36) PRIMARY KEY,
    attendance_session_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    status VARCHAR(50) NOT NULL,
    check_in_method VARCHAR(50) NOT NULL DEFAULT 'MANUAL',
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_session_student (attendance_session_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    },
    DOCKER: {
      title: 'Docker Compose Production Orchestration',
      filename: 'docker-compose.yml',
      lang: 'yaml',
      description: 'Docker Compose file running MySQL 8.0, Spring Boot backend, and React frontend.',
      content: `version: '3.8'

services:
  mysql-db:
    image: mysql:8.0
    container_name: smart_attendance_mysql
    restart: always
    environment:
      MYSQL_DATABASE: attendance_db
      MYSQL_ROOT_PASSWORD: rootpassword
    ports:
      - "3306:3306"

  spring-boot-backend:
    build:
      context: ./backend
    container_name: smart_attendance_backend
    ports:
      - "8080:8080"

  react-frontend:
    build:
      context: .
    ports:
      - "3000:3000"`
    },
    POM: {
      title: 'Maven Project Object Model (Java 21 + Spring Boot 3.3.4)',
      filename: 'backend/pom.xml',
      lang: 'xml',
      description: 'Maven configuration specifying Java 21 LTS and Spring Boot dependencies.',
      content: `<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
    </parent>
    <groupId>com.example</groupId>
    <artifactId>smart-student-attendance</artifactId>
    <version>1.0.0-SNAPSHOT</version>

    <properties>
        <java.version>21</java.version>
    </properties>
</project>`
    }
  };

  const currentSnippet = codeSnippets[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-blue-600" />
            <span>Java OOP Architecture: Inheritance & Abstraction</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Production object-oriented design in Java 21 Spring Boot: MappedSuperclass, Abstract Classes, and Strategy Interfaces
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs bg-purple-50 text-purple-800 border border-purple-200 px-3 py-1.5 rounded-lg font-mono font-medium flex items-center space-x-1.5">
            <GitFork className="w-3.5 h-3.5 text-purple-600" />
            <span>OOP Principles Verified</span>
          </span>
          <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg font-mono font-medium">
            Java 21 LTS
          </span>
        </div>
      </div>

      {/* Visual Architectural Diagram Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-md">
        <h2 className="text-sm font-bold text-blue-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
          <Boxes className="w-4 h-4" />
          <span>Object-Oriented Class Hierarchy Diagram</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          {/* Box 1: Inheritance */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
            <div className="text-amber-400 font-bold flex items-center space-x-1.5">
              <GitFork className="w-4 h-4" />
              <span>1. Entity Inheritance</span>
            </div>
            <div className="text-slate-300 space-y-1">
              <p className="text-white font-bold">BaseEntity (@MappedSuperclass)</p>
              <p className="pl-3 border-l border-slate-700">└─ <strong className="text-blue-300">AbstractAcademicPerson</strong> (abstract)</p>
              <p className="pl-6 border-l border-slate-700">├─ <strong className="text-emerald-400">Student</strong> (rollNumber, semester)</p>
              <p className="pl-6 border-l border-slate-700">└─ <strong className="text-emerald-400">Teacher</strong> (staffId, assignments)</p>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-2">
              Provides code reuse of id, audit dates, and common contact fields while allowing distinct identity behaviors.
            </p>
          </div>

          {/* Box 2: Template Method Abstraction */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
            <div className="text-emerald-400 font-bold flex items-center space-x-1.5">
              <Layers className="w-4 h-4" />
              <span>2. Template Method Abstraction</span>
            </div>
            <div className="text-slate-300 space-y-1">
              <p className="text-blue-300 font-bold">AbstractAttendanceProcessor (abstract)</p>
              <p className="text-[11px] text-slate-400 pl-3">↳ public final processCheckIn()</p>
              <p className="pl-3 border-l border-slate-700">├─ <strong className="text-emerald-400">ManualAttendanceProcessor</strong></p>
              <p className="pl-3 border-l border-slate-700">└─ <strong className="text-emerald-400">QrCodeAttendanceProcessor</strong></p>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-2">
              Template method freezes invariant verification steps, delegating subtype validation to child classes.
            </p>
          </div>

          {/* Box 3: Interface Abstraction (Strategy) */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
            <div className="text-purple-400 font-bold flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>3. Interface Strategy Abstraction</span>
            </div>
            <div className="text-slate-300 space-y-1">
              <p className="text-purple-300 font-bold">&laquo;interface&raquo; AttendancePolicyStrategy</p>
              <p className="pl-3 border-l border-slate-700">├─ <strong className="text-emerald-400">StandardAttendancePolicy</strong> (75%)</p>
              <p className="pl-3 border-l border-slate-700">└─ <strong className="text-emerald-400">StrictAttendancePolicy</strong> (80%)</p>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-2">
              Hides mathematical percentage calculation rules behind an interface for runtime polymorphism.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('OOP_EXPLANATION')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'OOP_EXPLANATION'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          📘 OOP Overview
        </button>

        <span className="text-slate-300">|</span>

        <button
          onClick={() => setActiveTab('ABSTRACT_PERSON')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'ABSTRACT_PERSON'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          AbstractAcademicPerson.java
        </button>

        <button
          onClick={() => setActiveTab('STUDENT_SUBCLASS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'STUDENT_SUBCLASS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Student.java (extends)
        </button>

        <button
          onClick={() => setActiveTab('TEACHER_SUBCLASS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'TEACHER_SUBCLASS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Teacher.java (extends)
        </button>

        <button
          onClick={() => setActiveTab('BASE_ENTITY')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'BASE_ENTITY'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          BaseEntity.java
        </button>

        <span className="text-slate-300">|</span>

        <button
          onClick={() => setActiveTab('TEMPLATE_PROCESSOR')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'TEMPLATE_PROCESSOR'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Template Method Processor
        </button>

        <button
          onClick={() => setActiveTab('STRATEGY_INTERFACE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'STRATEGY_INTERFACE'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Policy Strategy Interface
        </button>

        <button
          onClick={() => setActiveTab('OOP_TEST')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'OOP_TEST'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          JUnit 5 OOP Test
        </button>

        <span className="text-slate-300">|</span>

        <button
          onClick={() => setActiveTab('FLYWAY_SCHEMA')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'FLYWAY_SCHEMA'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Flyway SQL Schema
        </button>

        <button
          onClick={() => setActiveTab('DOCKER')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'DOCKER'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          docker-compose.yml
        </button>

        <button
          onClick={() => setActiveTab('POM')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'POM'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          pom.xml
        </button>
      </div>

      {/* Description Strip */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-center justify-between">
        <div>
          <span className="font-bold">{currentSnippet.title}:</span> {currentSnippet.description}
        </div>
        <span className="font-mono text-[11px] text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
          {currentSnippet.filename}
        </span>
      </div>

      {/* Code Viewer Card */}
      <div className="bg-slate-950 text-slate-200 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        {/* Terminal Header */}
        <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
            <span className="text-xs font-mono text-slate-400 ml-2 font-medium">
              {currentSnippet.filename}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy File Content'}</span>
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 overflow-x-auto font-mono text-xs leading-relaxed max-h-[550px] overflow-y-auto">
          <pre className="text-slate-300">
            <code>{currentSnippet.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
