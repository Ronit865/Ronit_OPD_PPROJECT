CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    full_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL
);

CREATE TABLE patients (
    id     BIGSERIAL PRIMARY KEY,
    name   VARCHAR(100) NOT NULL,
    gender VARCHAR(10)  NOT NULL CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    age    INT          NOT NULL CHECK (age BETWEEN 0 AND 120),
    phone  VARCHAR(10)  NOT NULL UNIQUE
);

CREATE TABLE appointments (
    id           BIGSERIAL PRIMARY KEY,
    patient_id   BIGINT      NOT NULL REFERENCES patients (id),
    doctor_id    BIGINT      NOT NULL REFERENCES users (id),
    scheduled_at TIMESTAMP   NOT NULL,
    status       VARCHAR(20) NOT NULL CHECK (status IN ('SCHEDULED', 'COMPLETED')),
    CONSTRAINT uq_doctor_slot UNIQUE (doctor_id, scheduled_at)
);

CREATE INDEX idx_appointments_scheduled_at ON appointments (scheduled_at);
CREATE INDEX idx_appointments_patient ON appointments (patient_id);

CREATE TABLE consultations (
    id             BIGSERIAL PRIMARY KEY,
    appointment_id BIGINT       NOT NULL UNIQUE REFERENCES appointments (id),
    blood_pressure VARCHAR(10)  NOT NULL,
    temperature    NUMERIC(4,1) NOT NULL,
    notes          TEXT         NOT NULL,
    completed_at   TIMESTAMP    NOT NULL
);
