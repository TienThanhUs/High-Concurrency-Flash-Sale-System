package com.hcmus.FlashMart_API.infrastructure.web;

import com.hcmus.FlashMart_API.domain.exception.ConflictException;
import com.hcmus.FlashMart_API.domain.exception.ForbiddenException;
import com.hcmus.FlashMart_API.domain.exception.ResourceNotFoundException;
import com.hcmus.FlashMart_API.domain.exception.UnauthorizedException;
import com.hcmus.FlashMart_API.infrastructure.dto.AppResponseError;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<AppResponseError> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> validationErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            validationErrors.put(fieldName, errorMessage);
        });

        AppResponseError response = new AppResponseError(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "VAL-001",
                "Dữ liệu đầu vào không hợp lệ",
                validationErrors
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<AppResponseError> handleIllegalArgument(IllegalArgumentException ex) {
        AppResponseError response = new AppResponseError(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "BAD-001",
                ex.getMessage(),
                Map.of()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler({UnauthorizedException.class, AuthenticationException.class})
    public ResponseEntity<AppResponseError> handleUnauthorized(RuntimeException ex) {
        AppResponseError response = new AppResponseError(
                LocalDateTime.now(),
                HttpStatus.UNAUTHORIZED.value(),
                "AUTH-401",
                ex.getMessage(),
                Map.of()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler({ForbiddenException.class, AccessDeniedException.class})
    public ResponseEntity<AppResponseError> handleForbidden(RuntimeException ex) {
        AppResponseError response = new AppResponseError(
                LocalDateTime.now(),
                HttpStatus.FORBIDDEN.value(),
                "AUTH-403",
                ex.getMessage(),
                Map.of()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<AppResponseError> handleNotFound(ResourceNotFoundException ex) {
        AppResponseError response = new AppResponseError(
                LocalDateTime.now(),
                HttpStatus.NOT_FOUND.value(),
                "RES-404",
                ex.getMessage(),
                Map.of()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<AppResponseError> handleConflict(ConflictException ex) {
        AppResponseError response = new AppResponseError(
                LocalDateTime.now(),
                HttpStatus.CONFLICT.value(),
                ex.getErrorCode(),
                ex.getMessage(),
                Map.of()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<AppResponseError> handleDataIntegrity(DataIntegrityViolationException ex) {
        AppResponseError response = new AppResponseError(
                LocalDateTime.now(),
                HttpStatus.CONFLICT.value(),
                "DB-409",
                "Dữ liệu bị trùng hoặc vi phạm ràng buộc",
                Map.of()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }
}
