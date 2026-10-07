-- Demo doctors (password for all: Doctor@123) and sample patients.
INSERT INTO users (full_name, email, password_hash, specialization) VALUES
    ('Dr. Anita Sharma', 'anita.sharma@opd.local', '$2a$10$eY4ykCvAaQv8HlgOQfhtGuj7ybwUcfhRhOMOrEt9Fumsp53YtQTi2', 'General Medicine'),
    ('Dr. Rohan Mehta',  'rohan.mehta@opd.local',  '$2a$10$eY4ykCvAaQv8HlgOQfhtGuj7ybwUcfhRhOMOrEt9Fumsp53YtQTi2', 'Pediatrics'),
    ('Dr. Kavya Iyer',   'kavya.iyer@opd.local',   '$2a$10$eY4ykCvAaQv8HlgOQfhtGuj7ybwUcfhRhOMOrEt9Fumsp53YtQTi2', 'Orthopedics')
ON CONFLICT (email) DO NOTHING;

INSERT INTO patients (name, gender, age, phone) VALUES
    ('Aarav Patel',  'MALE',   34, '9876543210'),
    ('Meera Nair',   'FEMALE', 28, '9123456780'),
    ('Sanjay Verma', 'MALE',   56, '9988776655')
ON CONFLICT (phone) DO NOTHING;
