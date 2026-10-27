package com.example.smartattendance.service.processor;

import org.springframework.stereotype.Component;

/**
 * Demonstrates INHERITANCE:
 * Extends AbstractAttendanceProcessor to implement dynamic QR token validation rules.
 */
@Component
public class QrCodeAttendanceProcessor extends AbstractAttendanceProcessor {

    @Override
    protected void validateCheckInRules(CheckInRequest request) {
        if (request.qrToken() == null || request.qrToken().length() < 10) {
            throw new IllegalArgumentException("Dynamic QR check-in requires a valid, non-empty session token.");
        }
    }

    @Override
    protected CheckInMethod getMethodType() {
        return CheckInMethod.QR_CODE;
    }
}
