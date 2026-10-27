package com.example.smartattendance.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDate;

/**
 * Student demonstrates INHERITANCE:
 * Inherits all common person fields (fullName, email, contactNumber, departmentId)
 * and entity identity (id, createdAt, updatedAt) from AbstractAcademicPerson -> BaseEntity.
 *
 * Implements the abstract methods defined in AbstractAcademicPerson (ABSTRACTION).
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

    // ==========================================
    // SPECIFIC STUDENT PROPERTIES
    // ==========================================

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getClassId() {
        return classId;
    }

    public void setClassId(String classId) {
        this.classId = classId;
    }

    public String getSectionId() {
        return sectionId;
    }

    public void setSectionId(String sectionId) {
        this.sectionId = sectionId;
    }

    public int getSemester() {
        return semester;
    }

    public void setSemester(int semester) {
        this.semester = semester;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }

    public LocalDate getEnrollmentDate() {
        return enrollmentDate;
    }

    public void setEnrollmentDate(LocalDate enrollmentDate) {
        this.enrollmentDate = enrollmentDate;
    }
}
