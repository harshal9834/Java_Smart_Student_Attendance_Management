package com.example.smartattendance.service.policy;

import com.example.smartattendance.service.AttendanceCalculationService.Status;
import org.springframework.stereotype.Component;
import java.util.List;

/**
 * Strict institutional policy:
 * - 80.0% threshold requirement
 * - LATE counts as 0 credit in numerator (must be on time)
 * - EXCUSED absences are still counted in denominator
 */
@Component("strictAttendancePolicy")
public class StrictAttendancePolicy implements AttendancePolicyStrategy {

    @Override
    public double calculateNumerator(List<Status> statuses, double lateWeight) {
        double numerator = 0.0;
        for (Status s : statuses) {
            if (s == Status.PRESENT) {
                numerator += 1.0;
            }
            // Strict policy ignores late arrivals (0.0 credit)
        }
        return numerator;
    }

    @Override
    public int calculateDenominator(List<Status> statuses, boolean excludeExcused) {
        int denominator = 0;
        for (Status s : statuses) {
            if (s != Status.UNMARKED) {
                // In strict policy, even excused absences count towards total held denominator
                denominator++;
            }
        }
        return denominator;
    }

    @Override
    public double getMinimumThresholdPercentage() {
        return 80.0;
    }

    @Override
    public String getPolicyName() {
        return "Strict Academic 80% Policy";
    }
}
