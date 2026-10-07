package com.opd.common;

import lombok.Getter;

public class ConflictException extends RuntimeException {

    /** Optional form field the conflict relates to (surfaced to the UI as a field error). */
    @Getter
    private final String field;

    public ConflictException(String message) {
        this(message, null);
    }

    public ConflictException(String message, String field) {
        super(message);
        this.field = field;
    }
}
