package com.opd.patient;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
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
class PatientControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    void registersPatient() throws Exception {
        create("Test Patient", "FEMALE", 30, randomPhone())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.gender").value("FEMALE"));
    }

    @Test
    void duplicatePhoneReturns409WithFieldError() throws Exception {
        String phone = randomPhone();
        create("First", "MALE", 40, phone).andExpect(status().isCreated());
        create("Second", "MALE", 41, phone).andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Phone number is already registered"))
                .andExpect(jsonPath("$.fieldErrors.phone").exists());
    }

    @Test
    void invalidInputReturns400WithFieldErrors() throws Exception {
        mockMvc.perform(post("/api/patients").with(jwt()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"gender\":null,\"age\":150,\"phone\":\"123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.name").exists())
                .andExpect(jsonPath("$.fieldErrors.gender").exists())
                .andExpect(jsonPath("$.fieldErrors.age").exists())
                .andExpect(jsonPath("$.fieldErrors.phone").exists());
    }

    @Test
    void unknownGenderReturns400() throws Exception {
        mockMvc.perform(post("/api/patients").with(jwt()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"X\",\"gender\":\"ROBOT\",\"age\":30,\"phone\":\"" + randomPhone() + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Malformed request"));
    }

    @Test
    void searchesByNamePartCaseInsensitiveAndByPhone() throws Exception {
        String token = UUID.randomUUID().toString().substring(0, 8);
        String phone = randomPhone();
        create("Zed" + token, "OTHER", 22, phone).andExpect(status().isCreated());

        mockMvc.perform(get("/api/patients").param("q", ("ZED" + token).substring(1, 8)).with(jwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].phone").value(phone));

        mockMvc.perform(get("/api/patients").param("q", phone.substring(2, 9)).with(jwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].phone").value(phone));
    }

    @Test
    void blankQueryListsAllAndWildcardsAreLiteral() throws Exception {
        mockMvc.perform(get("/api/patients").param("q", "  ").with(jwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", greaterThanOrEqualTo(3)));
        mockMvc.perform(get("/api/patients").param("q", "%").with(jwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void requiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/patients")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/doctors")).andExpect(status().isUnauthorized());
    }

    @Test
    void listsSeededDoctorsWithoutSensitiveData() throws Exception {
        mockMvc.perform(get("/api/doctors").with(jwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", greaterThanOrEqualTo(3)))
                .andExpect(jsonPath("$[?(@.email=='anita.sharma@opd.local')].specialization").value("General Medicine"))
                .andExpect(jsonPath("$[0].passwordHash").doesNotExist());
    }

    private ResultActions create(String name, String gender, int age, String phone) throws Exception {
        return mockMvc.perform(post("/api/patients").with(jwt()).contentType(MediaType.APPLICATION_JSON)
                .content(String.format("{\"name\":\"%s\",\"gender\":\"%s\",\"age\":%d,\"phone\":\"%s\"}",
                        name, gender, age, phone)));
    }

    private String randomPhone() {
        return String.valueOf(ThreadLocalRandom.current().nextLong(7_000_000_000L, 9_999_999_999L));
    }
}
