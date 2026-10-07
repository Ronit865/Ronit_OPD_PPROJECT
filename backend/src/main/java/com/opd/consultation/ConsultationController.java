package com.opd.consultation;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;

    @PutMapping("/api/consultations/{appointmentId}")
    public ConsultationResponse complete(
            @PathVariable Long appointmentId, @Valid @RequestBody ConsultationRequest request) {
        return consultationService.complete(appointmentId, request);
    }

    @GetMapping("/api/patients/{patientId}/consultations")
    public List<ConsultationResponse> history(@PathVariable Long patientId) {
        return consultationService.historyForPatient(patientId);
    }
}
