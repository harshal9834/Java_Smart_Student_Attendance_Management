package com.example.smartattendance.model;

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
     * Abstract method: Subclasses must provide their unique institutional identifier.
     * E.g., Student returns Roll Number (e.g., CS23B101), Teacher returns Staff ID (e.g., EMP-101).
     */
    public abstract String getInstitutionalIdentifier();

    /**
     * Abstract method: Subclasses must declare their role designation.
     */
    public abstract String getRoleName();

    // ==========================================
    // CONCRETE GETTERS AND SETTERS
    // ==========================================

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(String departmentId) {
        this.departmentId = departmentId;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }
}
