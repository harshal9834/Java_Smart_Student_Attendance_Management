package com.example.smartattendance.service;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class AttendanceCalculationService {

    public enum Status {
        PRESENT, ABSENT, LATE, EXCUSED, UNMARKED
    }

    public record CalculationResult(
        int totalEligible,
        double countedAttended,
        int presentCount,
        int absentCount,
        int lateCount,
        int excusedCount,
        double attendancePercentage,
        boolean isDefaulter,
        int classesNeededForThreshold
    ) {}

    /**
     * Calculates student attendance percentage strictly adhering to institutional policy:
     * Percentage = (Counted Attended Sessions / Eligible Recorded Sessions) * 100
     *
     * @param statuses List of attendance statuses for eligible held sessions
     * @param threshold Minimum acceptable attendance percentage (e.g., 75.0)
     * @param countLateAsAttended Whether LATE records contribute to attended count
     * @param lateWeight Numerical weight for LATE (e.g., 1.0 or 0.5)
     * @param excludeExcusedFromDenominator Whether EXCUSED records reduce the denominator
     * @return CalculationResult with exact percentage rounded to 1 decimal place
     */
    public CalculationResult calculate(
            List<Status> statuses,
            double threshold,
            boolean countLateAsAttended,
            double lateWeight,
            boolean excludeExcusedFromDenominator) {

        if (statuses == null || statuses.isEmpty()) {
            return new CalculationResult(0, 0.0, 0, 0, 0, 0, 0.0, false, 0);
        }

        double attended = 0.0;
        int denominator = 0;
        int present = 0;
        int absent = 0;
        int late = 0;
        int excused = 0;

        for (Status status : statuses) {
            switch (status) {
                case PRESENT -> {
                    attended += 1.0;
                    denominator++;
                    present++;
                }
                case LATE -> {
                    if (countLateAsAttended) {
                        attended += lateWeight;
                    }
                    denominator++;
                    late++;
                }
                case ABSENT -> {
                    denominator++;
                    absent++;
                }
                case EXCUSED -> {
                    excused++;
                    if (!excludeExcusedFromDenominator) {
                        denominator++;
                    }
                }
                case UNMARKED -> {
                    // Unmarked sessions do not count as completed attendance
                }
            }
        }

        if (denominator == 0) {
            return new CalculationResult(0, 0.0, present, absent, late, excused, 0.0, false, 0);
        }

        double rawPercentage = (attended / denominator) * 100.0;
        BigDecimal rounded = BigDecimal.valueOf(rawPercentage).setScale(1, RoundingMode.HALF_UP);
        double finalPercentage = rounded.doubleValue();

        boolean isDefaulter = finalPercentage < threshold;

        int classesNeeded = 0;
        if (isDefaulter && threshold < 100.0) {
            double targetRatio = threshold / 100.0;
            // Formula: (attended + X) / (denominator + X) >= targetRatio
            // => X * (1 - targetRatio) >= targetRatio * denominator - attended
            double needed = (targetRatio * denominator - attended) / (1.0 - targetRatio);
            classesNeeded = Math.max(0, (int) Math.ceil(needed));
        }

        return new CalculationResult(
            denominator,
            attended,
            present,
            absent,
            late,
            excused,
            finalPercentage,
            isDefaulter,
            classesNeeded
        );
    }
}
