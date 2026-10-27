package com.example.smartattendance.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * Teacher demonstrates INHERITANCE:
 * Extends AbstractAcademicPerson to reuse core identity, personal contact, and department attributes.
 *
 * Implements abstract methods to fulfill the abstraction contract.
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

    // ==========================================
    // IMPLEMENTATION OF ABSTRACT CONTRACT
    // ==========================================

    @Override
    public String getInstitutionalIdentifier() {
        return this.staffId;
    }

    @Override
    public String getRoleName() {
        return "TEACHER";
    }

    public String getStaffId() {
        return staffId;
    }

    public void setStaffId(String staffId) {
        this.staffId = staffId;
    }
}
