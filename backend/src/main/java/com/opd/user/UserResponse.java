package com.opd.user;

public record UserResponse(Long id, String fullName, String email, String specialization) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getSpecialization());
    }
}
