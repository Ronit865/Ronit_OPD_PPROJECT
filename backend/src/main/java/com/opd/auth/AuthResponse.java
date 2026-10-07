package com.opd.auth;

import com.opd.user.UserResponse;

public record AuthResponse(String token, UserResponse user) {
}
