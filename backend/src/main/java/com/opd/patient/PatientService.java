package com.opd.patient;

import com.opd.common.ConflictException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patients;

    @Transactional
    public PatientResponse register(PatientRequest request) {
        String phone = request.phone();
        if (patients.existsByPhone(phone)) {
            throw new ConflictException("Phone number is already registered", "phone");
        }
        Patient patient = new Patient();
        patient.setName(request.name().trim());
        patient.setGender(request.gender());
        patient.setAge(request.age());
        patient.setPhone(phone);
        return PatientResponse.from(patients.save(patient));
    }

    /** Lists all patients, or filters by a name/phone fragment when {@code query} is not blank. */
    @Transactional(readOnly = true)
    public List<PatientResponse> list(String query) {
        List<Patient> result = (query == null || query.isBlank())
                ? patients.findAllByOrderByNameAsc()
                : patients.search(escapeLike(query.trim()));
        return result.stream().map(PatientResponse::from).toList();
    }

    private String escapeLike(String term) {
        return term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
