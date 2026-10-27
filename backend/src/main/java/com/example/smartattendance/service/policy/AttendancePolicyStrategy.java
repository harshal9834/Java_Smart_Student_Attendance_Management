package com.example.smartattendance.service.policy;

import com.example.smartattendance.service.AttendanceCalculationService.Status;
import java.util.List;

/**
 * Demonstrates ABSTRACTION:
 * This interface defines the contract for attendance percentage calculations.
 * The high-level calculation engine depends upon this ABSTRACTION rather than concrete details
 * (Dependency Inversion Principle).
 */
public interface AttendancePolicyStrategy {

    /**
     * Calculates the counted attended sessions numerator according to policy rules.
     */
    double calculateNumerator(List<Status> statuses, double lateWeight);

    /**
     * Calculates the eligible sessions denominator according to policy rules.
     */
    int calculateDenominator(List<Status> statuses, boolean excludeExcused);

    /**
     * Returns the institutional minimum attendance percentage requirement (e.g. 75.0 or 80.0).
     */
    double getMinimumThresholdPercentage();

    /**
     * Returns human-readable policy identifier.
     */
    String getPolicyName();
}
