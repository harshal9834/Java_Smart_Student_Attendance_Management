package com.example.smartattendance.service.processor;

import org.springframework.stereotype.Component;

/**
 * Demonstrates INHERITANCE:
 * Extends AbstractAttendanceProcessor to implement manual attendance validation rules.
 */
@Component
public class ManualAttendanceProcessor extends AbstractAttendanceProcessor {

    @Override
    protected void validateCheckInRules(CheckInRequest request) {
        if (request.markedBy() == null || request.markedBy().isBlank()) {
            throw new IllegalStateException("Manual attendance recording requires an authorized teacher or administrator identity.");
        }
    }

    @Override
    protected CheckInMethod getMethodType() {
        return CheckInMethod.MANUAL;
    }
}
