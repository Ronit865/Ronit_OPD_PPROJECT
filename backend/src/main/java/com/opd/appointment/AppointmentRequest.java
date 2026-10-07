package com.opd.appointment;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record AppointmentRequest(
        @NotNull(message = "Patient is required") Long patientId,
        @NotNull(message = "Doctor is required") Long doctorId,
        @NotNull(message = "Date and time are required") LocalDateTime scheduledAt) {
}
