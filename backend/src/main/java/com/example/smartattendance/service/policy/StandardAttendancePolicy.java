package com.example.smartattendance.service.policy;

import com.example.smartattendance.service.AttendanceCalculationService.Status;
import org.springframework.stereotype.Component;
import java.util.List;

/**
 * Standard institutional policy:
 * - 75.0% threshold requirement
 * - LATE counts as attended (1.0 or configurable weight)
 * - EXCUSED is excluded from denominator
 */
@Component("standardAttendancePolicy")
public class StandardAttendancePolicy implements AttendancePolicyStrategy {

    @Override
    public double calculateNumerator(List<Status> statuses, double lateWeight) {
        double numerator = 0.0;
        for (Status s : statuses) {
            if (s == Status.PRESENT) {
                numerator += 1.0;
            } else if (s == Status.LATE) {
                numerator += lateWeight;
            }
        }
        return numerator;
    }

    @Override
    public int calculateDenominator(List<Status> statuses, boolean excludeExcused) {
        int denominator = 0;
        for (Status s : statuses) {
            if (s == Status.PRESENT || s == Status.LATE || s == Status.ABSENT) {
                denominator++;
            } else if (s == Status.EXCUSED && !excludeExcused) {
                denominator++;
            }
        }
        return denominator;
    }

    @Override
    public double getMinimumThresholdPercentage() {
        return 75.0;
    }

    @Override
    public String getPolicyName() {
        return "Standard Institutional 75% Policy";
    }
}
