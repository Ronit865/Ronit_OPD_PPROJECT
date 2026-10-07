package com.opd.consultation;

import com.opd.user.UserResponse;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ConsultationResponse(
        Long id,
        Long appointmentId,
        LocalDateTime scheduledAt,
        UserResponse doctor,
        String bloodPressure,
        BigDecimal temperature,
        String notes,
        LocalDateTime completedAt) {

    public static ConsultationResponse from(Consultation c) {
        return new ConsultationResponse(
                c.getId(),
                c.getAppointment().getId(),
                c.getAppointment().getScheduledAt(),
                UserResponse.from(c.getAppointment().getDoctor()),
                c.getBloodPressure(),
                c.getTemperature(),
                c.getNotes(),
                c.getCompletedAt());
    }
}
