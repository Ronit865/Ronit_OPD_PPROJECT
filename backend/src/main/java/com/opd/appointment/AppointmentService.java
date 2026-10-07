package com.opd.appointment;

import com.opd.common.BadRequestException;
import com.opd.common.ConflictException;
import com.opd.common.NotFoundException;
import com.opd.patient.Patient;
import com.opd.patient.PatientRepository;
import com.opd.user.User;
import com.opd.user.UserRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointments;
    private final PatientRepository patients;
    private final UserRepository users;

    @Transactional
    public AppointmentResponse book(AppointmentRequest request) {
        // Slots are minute-granular, so "10:30:45" and "10:30:00" are the same slot.
        LocalDateTime scheduledAt = request.scheduledAt().truncatedTo(ChronoUnit.MINUTES);
        if (scheduledAt.isBefore(LocalDateTime.now().truncatedTo(ChronoUnit.MINUTES))) {
            throw new BadRequestException("Appointment time cannot be in the past", "scheduledAt");
        }
        Patient patient = patients.findById(request.patientId())
                .orElseThrow(() -> new NotFoundException("Patient not found"));
        User doctor = users.findById(request.doctorId())
                .orElseThrow(() -> new NotFoundException("Doctor not found"));
        if (appointments.existsByDoctorIdAndScheduledAt(doctor.getId(), scheduledAt)) {
            throw new ConflictException("This doctor is already booked at the selected time", "scheduledAt");
        }

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setScheduledAt(scheduledAt);
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        return AppointmentResponse.from(appointments.save(appointment));
    }

    /** Today's appointments (server date), earliest first. */
    @Transactional(readOnly = true)
    public List<AppointmentResponse> listToday() {
        LocalDate today = LocalDate.now();
        return appointments.findBetween(today.atStartOfDay(), today.plusDays(1).atStartOfDay())
                .stream().map(AppointmentResponse::from).toList();
    }
}
