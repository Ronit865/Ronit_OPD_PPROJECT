package com.opd.appointment;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AppointmentAndConsultationTest {

    @Autowired
    MockMvc mockMvc;

    // ── Appointments ──────────────────────────────────────────────────────────

    @Test
    void booksAppointmentAndAppearsInToday() throws Exception {
        long[] ids = setup();
        LocalDateTime now = LocalDateTime.now().plusMinutes(5);

        String body = book(ids[0], ids[1], now)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("SCHEDULED"))
                .andExpect(jsonPath("$.patient.id").value(ids[0]))
                .andExpect(jsonPath("$.doctor.id").value(ids[1]))
                .andReturn().getResponse().getContentAsString();
        int id = (int) JsonPath.read(body, "$.id");

        mockMvc.perform(get("/api/appointments/today").with(jwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id==" + id + ")]").exists());
    }

    @Test
    void pastDateReturns400WithFieldError() throws Exception {
        long[] ids = setup();
        book(ids[0], ids[1], LocalDateTime.now().minusHours(1))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.scheduledAt").exists());
    }

    @Test
    void doubleBookingSameSlotReturns409() throws Exception {
        long[] ids = setup();
        LocalDateTime slot = LocalDateTime.now().plusHours(3);
        book(ids[0], ids[1], slot).andExpect(status().isCreated());
        book(ids[0], ids[1], slot).andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("This doctor is already booked at the selected time"))
                .andExpect(jsonPath("$.fieldErrors.scheduledAt").exists());
    }

    @Test
    void unknownPatientOrDoctorReturns404() throws Exception {
        long[] ids = setup();
        book(99999L, ids[1], LocalDateTime.now().plusHours(1)).andExpect(status().isNotFound());
        book(ids[0], 99999L, LocalDateTime.now().plusHours(2)).andExpect(status().isNotFound());
    }

    // ── Consultations ─────────────────────────────────────────────────────────

    @Test
    void completesConsultationAndAppearsInHistory() throws Exception {
        long[] ids = setup();
        long apptId = bookAndGetId(ids[0], ids[1], LocalDateTime.now().plusMinutes(10));

        mockMvc.perform(put("/api/consultations/" + apptId).with(jwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"bloodPressure\":\"120/80\",\"temperature\":37.2,\"notes\":\"All good\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bloodPressure").value("120/80"))
                .andExpect(jsonPath("$.temperature").value(37.2))
                .andExpect(jsonPath("$.completedAt").exists());

        mockMvc.perform(get("/api/patients/" + ids[0] + "/consultations").with(jwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].bloodPressure").value("120/80"));
    }

    @Test
    void completingTwiceReturns409() throws Exception {
        long[] ids = setup();
        long apptId = bookAndGetId(ids[0], ids[1], LocalDateTime.now().plusMinutes(15));
        complete(apptId).andExpect(status().isOk());
        complete(apptId).andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("This consultation is already completed"));
    }

    @Test
    void invalidVitalsReturn400WithFieldErrors() throws Exception {
        long[] ids = setup();
        long apptId = bookAndGetId(ids[0], ids[1], LocalDateTime.now().plusMinutes(20));
        mockMvc.perform(put("/api/consultations/" + apptId).with(jwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"bloodPressure\":\"bad\",\"temperature\":99.9,\"notes\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.bloodPressure").exists())
                .andExpect(jsonPath("$.fieldErrors.temperature").exists())
                .andExpect(jsonPath("$.fieldErrors.notes").exists());
    }

    @Test
    void historyForUnknownPatientReturns404() throws Exception {
        mockMvc.perform(get("/api/patients/99999/consultations").with(jwt()))
                .andExpect(status().isNotFound());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Creates a unique patient + uses first seeded doctor. Returns [patientId, doctorId]. */
    private long[] setup() throws Exception {
        String phone = String.valueOf(7_000_000_000L + (long) (Math.random() * 999_999_999));
        String pb = mockMvc.perform(post("/api/patients").with(jwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Test\",\"gender\":\"MALE\",\"age\":30,\"phone\":\"" + phone + "\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long patientId = ((Number) JsonPath.read(pb, "$.id")).longValue();

        String db = mockMvc.perform(get("/api/doctors").with(jwt()))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        long doctorId = ((Number) ((java.util.List<?>) JsonPath.read(db, "$[*].id")).get(0)).longValue();

        return new long[]{patientId, doctorId};
    }

    private ResultActions book(long patientId, long doctorId, LocalDateTime at) throws Exception {
        String ts = at.truncatedTo(java.time.temporal.ChronoUnit.SECONDS)
                .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        return mockMvc.perform(post("/api/appointments").with(jwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(String.format(
                        "{\"patientId\":%d,\"doctorId\":%d,\"scheduledAt\":\"%s\"}", patientId, doctorId, ts)));
    }

    private long bookAndGetId(long patientId, long doctorId, LocalDateTime at) throws Exception {
        String body = book(patientId, doctorId, at)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(body, "$.id")).longValue();
    }

    private ResultActions complete(long apptId) throws Exception {
        return mockMvc.perform(put("/api/consultations/" + apptId).with(jwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"bloodPressure\":\"118/78\",\"temperature\":36.8,\"notes\":\"Stable\"}"));
    }
}
