package com.hcmus.FlashMart_API.domain.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message)
    {
        super(message);
    }
}
