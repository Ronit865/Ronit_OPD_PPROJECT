package com.opd.appointment;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    boolean existsByDoctorIdAndScheduledAt(Long doctorId, LocalDateTime scheduledAt);

    /** Appointments in [start, end), with patient and doctor loaded for the response. */
    @Query("""
            select a from Appointment a
            join fetch a.patient
            join fetch a.doctor
            where a.scheduledAt >= :start and a.scheduledAt < :end
            order by a.scheduledAt
            """)
    List<Appointment> findBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
