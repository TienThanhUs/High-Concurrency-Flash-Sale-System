package com.hcmus.FlashMart_API.infrastructure.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class AppResponseError {
    private LocalDateTime dateTime;
    private int status;
    private String errorCode;
    private String message;
    private Map<String,String> details;

    public AppResponseError(LocalDateTime dateTime, int status, String errorCode, String message, Map<String, String> details) {
        this.dateTime = dateTime;
        this.status = status;
        this.errorCode = errorCode;
        this.message = message;
        this.details = details;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public int getStatus() {
        return status;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public String getMessage() {
        return message;
    }

    public Map<String, String> getDetails() {
        return details;
    }
}
