package com.opd.appointment;

import com.opd.patient.PatientResponse;
import com.opd.user.UserResponse;
import java.time.LocalDateTime;

public record AppointmentResponse(
        Long id,
        LocalDateTime scheduledAt,
        AppointmentStatus status,
        PatientResponse patient,
        UserResponse doctor) {

    public static AppointmentResponse from(Appointment appointment) {
        return new AppointmentResponse(
                appointment.getId(),
                appointment.getScheduledAt(),
                appointment.getStatus(),
                PatientResponse.from(appointment.getPatient()),
                UserResponse.from(appointment.getDoctor()));
    }
}
