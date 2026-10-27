package com.example.smartattendance.service.processor;

import java.time.LocalDateTime;

/**
 * Demonstrates the classic GoF Template Method Pattern utilizing:
 * 1. ABSTRACTION: Invariant skeleton algorithm defined in an abstract class.
 * 2. INHERITANCE: Specific check-in mechanisms override primitive hooks.
 */
public abstract class AbstractAttendanceProcessor {

    public enum CheckInMethod {
        MANUAL, QR_CODE, CORRECTION
    }

    public record CheckInRequest(
        String sessionId,
        String studentId,
        String studentRoll,
        String status,
        String qrToken,
        String remarks,
        String markedBy
    ) {}

    public record ProcessedResult(
        String recordId,
        String sessionId,
        String studentId,
        String status,
        CheckInMethod method,
        LocalDateTime timestamp,
        boolean success,
        String message
    ) {}

    /**
     * TEMPLATE METHOD (final, cannot be overridden by subclasses).
     * Enforces the invariant attendance check-in workflow.
     */
    public final ProcessedResult processCheckIn(CheckInRequest request) {
        // Step 1: Pre-validation common to all attendance entries
        if (request.sessionId() == null || request.studentId() == null) {
            throw new IllegalArgumentException("Session ID and Student ID are mandatory.");
        }

        // Step 2: Hook for subtype-specific validation (ABSTRACTION: Subclasses must implement)
        validateCheckInRules(request);

        // Step 3: Determine check-in method type (ABSTRACTION: Subclasses define)
        CheckInMethod method = getMethodType();

        // Step 4: Construct audit record
        String recordId = "rec-" + request.sessionId() + "-" + request.studentId();
        LocalDateTime markedAt = LocalDateTime.now();

        // Step 5: Post-processing hook (Optional template hook)
        onCheckInSuccess(request, method);

        return new ProcessedResult(
            recordId,
            request.sessionId(),
            request.studentId(),
            request.status() != null ? request.status() : "PRESENT",
            method,
            markedAt,
            true,
            "Attendance successfully registered via " + method
        );
    }

    /**
     * ABSTRACT METHOD: Each subclass enforces its unique check-in rules.
     */
    protected abstract void validateCheckInRules(CheckInRequest request);

    /**
     * ABSTRACT METHOD: Returns the enum representing this check-in method.
     */
    protected abstract CheckInMethod getMethodType();

    /**
     * HOOK METHOD (optional override for subclasses)
     */
    protected void onCheckInSuccess(CheckInRequest request, CheckInMethod method) {
        // Default: no-op or standard log
    }
}
