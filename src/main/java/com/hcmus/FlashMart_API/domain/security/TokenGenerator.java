package com.hcmus.FlashMart_API.domain.security;

import com.hcmus.FlashMart_API.domain.entity.Role;

public interface TokenGenerator {
    String generateToken(Long userId, String email, Role role);
}
