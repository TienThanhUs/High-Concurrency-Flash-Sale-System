package com.hcmus.FlashMart_API.infrastructure.dto;

import lombok.Builder;
import lombok.Data;

@Builder
public class AuthenticationResponse {
    String jwt;
    public String getJwt() {
        return jwt;
    }
}
