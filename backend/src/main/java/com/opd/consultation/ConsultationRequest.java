package com.opd.consultation;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ConsultationRequest(
        @NotBlank(message = "Blood pressure is required")
        @Pattern(regexp = "\\d{2,3}/\\d{2,3}", message = "Blood pressure must look like 120/80")
        String bloodPressure,

        @NotNull(message = "Temperature is required")
        @DecimalMin(value = "30.0", message = "Temperature must be between 30 and 45 °C")
        @DecimalMax(value = "45.0", message = "Temperature must be between 30 and 45 °C")
        @Digits(integer = 2, fraction = 1, message = "Temperature allows one decimal place")
        BigDecimal temperature,

        @NotBlank(message = "Notes are required")
        @Size(max = 2000, message = "Notes must be at most 2000 characters")
        String notes) {
}
