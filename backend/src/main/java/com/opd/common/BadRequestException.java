package com.opd.common;

import lombok.Getter;

public class BadRequestException extends RuntimeException {

    /** Optional form field the problem relates to (surfaced to the UI as a field error). */
    @Getter
    private final String field;

    public BadRequestException(String message) {
        this(message, null);
    }

    public BadRequestException(String message, String field) {
        super(message);
        this.field = field;
    }
}
