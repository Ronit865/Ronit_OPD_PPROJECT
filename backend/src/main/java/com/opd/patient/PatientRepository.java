package com.opd.patient;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    boolean existsByPhone(String phone);

    List<Patient> findAllByOrderByNameAsc();

    /** Case-insensitive partial match on name or phone. {@code term} must be LIKE-escaped by the caller. */
    @Query("""
            select p from Patient p
            where lower(p.name) like lower(concat('%', :term, '%')) escape '\\'
               or p.phone like concat('%', :term, '%') escape '\\'
            order by p.name
            """)
    List<Patient> search(@Param("term") String term);
}
