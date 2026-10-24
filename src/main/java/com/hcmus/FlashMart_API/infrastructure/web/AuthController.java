package com.hcmus.FlashMart_API.infrastructure.web;

import com.hcmus.FlashMart_API.infrastructure.dto.AuthenticationRequest;
import com.hcmus.FlashMart_API.infrastructure.dto.AuthenticationResponse;
import com.hcmus.FlashMart_API.infrastructure.dto.RegisterRequest;
import com.hcmus.FlashMart_API.usecase.LoginUseCase;
import com.hcmus.FlashMart_API.usecase.RegisterUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final RegisterUseCase registerUseCase;
    private final LoginUseCase loginUseCase;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@Valid @RequestBody RegisterRequest request) {
        String jwt = registerUseCase.execute(request.getUsername(), request.getEmail(), request.getPassword());
        return ResponseEntity.ok(AuthenticationResponse.builder().jwt(jwt).build());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@Valid @RequestBody AuthenticationRequest request) {
        String jwt = loginUseCase.execute(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(AuthenticationResponse.builder().jwt(jwt).build());
    }
}