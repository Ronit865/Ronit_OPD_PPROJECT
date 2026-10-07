package com.opd.consultation;

import com.opd.appointment.Appointment;
import com.opd.appointment.AppointmentRepository;
import com.opd.appointment.AppointmentStatus;
import com.opd.common.ConflictException;
import com.opd.common.NotFoundException;
import com.opd.patient.PatientRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRepository consultations;
    private final AppointmentRepository appointments;
    private final PatientRepository patients;

    /** Saves vitals + notes for an appointment and marks it COMPLETED in one step. */
    @Transactional
    public ConsultationResponse complete(Long appointmentId, ConsultationRequest request) {
        Appointment appointment = appointments.findById(appointmentId)
                .orElseThrow(() -> new NotFoundException("Appointment not found"));
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new ConflictException("This consultation is already completed");
        }

        Consultation consultation = new Consultation();
        consultation.setAppointment(appointment);
        consultation.setBloodPressure(request.bloodPressure());
        consultation.setTemperature(request.temperature());
        consultation.setNotes(request.notes().trim());
        consultation.setCompletedAt(LocalDateTime.now());
        appointment.setStatus(AppointmentStatus.COMPLETED);
        return ConsultationResponse.from(consultations.save(consultation));
    }

    @Transactional(readOnly = true)
    public List<ConsultationResponse> historyForPatient(Long patientId) {
        if (!patients.existsById(patientId)) {
            throw new NotFoundException("Patient not found");
        }
        return consultations.findByPatientId(patientId).stream().map(ConsultationResponse::from).toList();
    }
}
