package com.opd.consultation;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConsultationRepository extends JpaRepository<Consultation, Long> {

    /** A patient's completed consultations, most recent first. */
    @Query("""
            select c from Consultation c
            join fetch c.appointment a
            join fetch a.doctor
            where a.patient.id = :patientId
            order by c.completedAt desc
            """)
    List<Consultation> findByPatientId(@Param("patientId") Long patientId);
}
