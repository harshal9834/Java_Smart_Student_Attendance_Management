package com.example.smartattendance.oop;

import com.example.smartattendance.model.AbstractAcademicPerson;
import com.example.smartattendance.model.Student;
import com.example.smartattendance.model.Teacher;
import com.example.smartattendance.service.AttendanceCalculationService.Status;
import com.example.smartattendance.service.policy.AttendancePolicyStrategy;
import com.example.smartattendance.service.policy.StandardAttendancePolicy;
import com.example.smartattendance.service.policy.StrictAttendancePolicy;
import com.example.smartattendance.service.processor.AbstractAttendanceProcessor;
import com.example.smartattendance.service.processor.ManualAttendanceProcessor;
import com.example.smartattendance.service.processor.QrCodeAttendanceProcessor;
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
        assertNotNull(student.getCreatedAt(), "CreatedAt should be initialized via BaseEntity constructor");

        // 2. Inherited fields from AbstractAcademicPerson
        assertEquals("Alex Johnson", student.getFullName());
        assertEquals("Dr. Sarah Mitchell", teacher.getFullName());

        // 3. Polymorphic execution of abstract methods (Dynamic Method Dispatch)
        assertEquals("CS23B101", student.getInstitutionalIdentifier());
        assertEquals("STUDENT", student.getRoleName());

        assertEquals("EMP-101", teacher.getInstitutionalIdentifier());
        assertEquals("TEACHER", teacher.getRoleName());
    }

    @Test
    @DisplayName("Abstraction via Template Method Pattern: Invariant check-in algorithm in AbstractAttendanceProcessor")
    void testTemplateMethodPattern() {
        AbstractAttendanceProcessor manualProcessor = new ManualAttendanceProcessor();
        AbstractAttendanceProcessor qrProcessor = new QrCodeAttendanceProcessor();

        // Manual check-in
        var manualReq = new AbstractAttendanceProcessor.CheckInRequest(
            "sess-1", "std-1", "CS23B101", "PRESENT", null, "Attended in lecture", "Prof. Mitchell"
        );
        var manualResult = manualProcessor.processCheckIn(manualReq);

        assertTrue(manualResult.success());
        assertEquals(AbstractAttendanceProcessor.CheckInMethod.MANUAL, manualResult.method());
        assertEquals("rec-sess-1-std-1", manualResult.recordId());

        // QR check-in
        var qrReq = new AbstractAttendanceProcessor.CheckInRequest(
            "sess-1", "std-1", "CS23B101", "PRESENT", "token-secure-12345", "QR scan", "SYSTEM"
        );
        var qrResult = qrProcessor.processCheckIn(qrReq);

        assertTrue(qrResult.success());
        assertEquals(AbstractAttendanceProcessor.CheckInMethod.QR_CODE, qrResult.method());

        // Subclass-specific validation rule: QR processor requires token
        var invalidQrReq = new AbstractAttendanceProcessor.CheckInRequest(
            "sess-1", "std-1", "CS23B101", "PRESENT", null, "Missing token", "SYSTEM"
        );
        assertThrows(IllegalArgumentException.class, () -> qrProcessor.processCheckIn(invalidQrReq));
    }

    @Test
    @DisplayName("Abstraction via Strategy Pattern: Polymorphic behavior across AttendancePolicyStrategy implementations")
    void testStrategyPatternAbstraction() {
        // Standard policy strategy
        AttendancePolicyStrategy standardPolicy = new StandardAttendancePolicy();
        assertEquals(75.0, standardPolicy.getMinimumThresholdPercentage());

        // Strict policy strategy
        AttendancePolicyStrategy strictPolicy = new StrictAttendancePolicy();
        assertEquals(80.0, strictPolicy.getMinimumThresholdPercentage());

        // Sample lecture record: 8 Present, 1 Late, 1 Absent
        List<Status> statuses = List.of(
            Status.PRESENT, Status.PRESENT, Status.PRESENT, Status.PRESENT,
            Status.PRESENT, Status.PRESENT, Status.PRESENT, Status.PRESENT,
            Status.LATE, Status.ABSENT
        );

        // Under Standard Strategy: Late receives 1.0 credit -> 8 + 1 = 9 attended
        double standardNumerator = standardPolicy.calculateNumerator(statuses, 1.0);
        assertEquals(9.0, standardNumerator);

        // Under Strict Strategy: Late receives 0 credit -> only 8 attended
        double strictNumerator = strictPolicy.calculateNumerator(statuses, 1.0);
        assertEquals(8.0, strictNumerator);
    }
}
