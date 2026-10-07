package com.opd.common;

import java.util.Map;

/** Uniform error body returned by every failing API call. {@code fieldErrors} is omitted when empty. */
@com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_EMPTY)
public record ApiError(int status, String message, Map<String, String> fieldErrors) {

    public static ApiError of(int status, String message) {
        return new ApiError(status, message, Map.of());
    }
}
