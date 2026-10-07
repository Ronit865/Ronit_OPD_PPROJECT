package com.opd;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.opd.patient.PatientRepository;
import com.opd.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BaseSetupTest {

    @Autowired
    UserRepository users;

    @Autowired
    PatientRepository patients;

    @Autowired
    MockMvc mockMvc;

    @Test
    void migrationsApplyAndSeedDataIsPresent() {
        assertThat(users.count()).isGreaterThanOrEqualTo(3);
        assertThat(patients.count()).isGreaterThanOrEqualTo(3);
        assertThat(users.findByEmail("anita.sharma@opd.local")).isPresent();
    }

    @Test
    void unknownRouteReturnsJsonErrorContract() throws Exception {
        mockMvc.perform(get("/api/does-not-exist").with(jwt()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Resource not found"));
    }
}
