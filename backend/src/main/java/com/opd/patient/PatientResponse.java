package com.opd.patient;

public record PatientResponse(Long id, String name, Gender gender, int age, String phone) {

    public static PatientResponse from(Patient patient) {
        return new PatientResponse(
                patient.getId(), patient.getName(), patient.getGender(), patient.getAge(), patient.getPhone());
    }
}
