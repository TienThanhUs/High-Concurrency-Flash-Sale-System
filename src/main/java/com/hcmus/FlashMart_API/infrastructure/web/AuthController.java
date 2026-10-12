package com.hcmus.FlashMart_API.infrastructure.web;

import com.hcmus.FlashMart_API.infrastructure.dto.AuthenticationResponse;
import com.hcmus.FlashMart_API.infrastructure.dto.RegisterRequest;
import com.hcmus.FlashMart_API.usecase.RegisterUseCase;
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

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
        String jwt = registerUseCase.execute(request.getUsername(), request.getEmail(), request.getPassword());
        AuthenticationResponse response = AuthenticationResponse.builder()
                .jwt(jwt)
                .build();
        return ResponseEntity.ok(response);
    }
}