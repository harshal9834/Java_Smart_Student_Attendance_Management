package com.example.smartattendance.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class AttendanceCalculationServiceTest {

    private final AttendanceCalculationService calculationService = new AttendanceCalculationService();

    @Test
    @DisplayName("Calculate standard 32 attended out of 40 sessions = 80.0%, not a defaulter for 75% threshold")
    void testStandardAttendanceCalculation() {
        // 32 present, 8 absent = 40 total
        List<AttendanceCalculationService.Status> statuses = new java.util.ArrayList<>();
        for (int i = 0; i < 32; i++) statuses.add(AttendanceCalculationService.Status.PRESENT);
        for (int i = 0; i < 8; i++) statuses.add(AttendanceCalculationService.Status.ABSENT);

        var result = calculationService.calculate(statuses, 75.0, true, 1.0, true);

        assertEquals(40, result.totalEligible());
        assertEquals(32.0, result.countedAttended());
        assertEquals(80.0, result.attendancePercentage());
        assertFalse(result.isDefaulter());
        assertEquals(0, result.classesNeededForThreshold());
    }

    @Test
    @DisplayName("Exactly 75.0% attendance is NOT below a 75.0% threshold")
    void testExactThresholdBoundary() {
        // 30 present out of 40 = 75.0%
        List<AttendanceCalculationService.Status> statuses = new java.util.ArrayList<>();
        for (int i = 0; i < 30; i++) statuses.add(AttendanceCalculationService.Status.PRESENT);
        for (int i = 0; i < 10; i++) statuses.add(AttendanceCalculationService.Status.ABSENT);

        var result = calculationService.calculate(statuses, 75.0, true, 1.0, true);

        assertEquals(75.0, result.attendancePercentage());
        assertFalse(result.isDefaulter(), "A student at exactly 75.0% should not be marked as a defaulter for 75.0% threshold");
    }

    @Test
    @DisplayName("Excused absence excluded from denominator improves student percentage")
    void testExcusedExclusion() {
        // 7 Present, 2 Absent, 1 Excused
        List<AttendanceCalculationService.Status> statuses = List.of(
            AttendanceCalculationService.Status.PRESENT,
            AttendanceCalculationService.Status.PRESENT,
            AttendanceCalculationService.Status.PRESENT,
            AttendanceCalculationService.Status.PRESENT,
            AttendanceCalculationService.Status.PRESENT,
            AttendanceCalculationService.Status.PRESENT,
            AttendanceCalculationService.Status.PRESENT,
            AttendanceCalculationService.Status.ABSENT,
            AttendanceCalculationService.Status.ABSENT,
            AttendanceCalculationService.Status.EXCUSED
        );

        // With excused excluded: denominator = 9 (7 present + 2 absent). 7/9 = 77.8%
        var resultExcluded = calculationService.calculate(statuses, 75.0, true, 1.0, true);
        assertEquals(9, resultExcluded.totalEligible());
        assertEquals(77.8, resultExcluded.attendancePercentage());
        assertFalse(resultExcluded.isDefaulter());

        // With excused included: denominator = 10. 7/10 = 70.0%
        var resultIncluded = calculationService.calculate(statuses, 75.0, true, 1.0, false);
        assertEquals(10, resultIncluded.totalEligible());
        assertEquals(70.0, resultIncluded.attendancePercentage());
        assertTrue(resultIncluded.isDefaulter());
    }

    @Test
    @DisplayName("Zero sessions handled safely with 0.0% without division by zero")
    void testZeroDivisionGuard() {
        var result = calculationService.calculate(List.of(), 75.0, true, 1.0, true);
        assertEquals(0, result.totalEligible());
        assertEquals(0.0, result.attendancePercentage());
        assertFalse(result.isDefaulter());
    }
}
