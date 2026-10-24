package com.hcmus.FlashMart_API.infrastructure.security;

import com.hcmus.FlashMart_API.domain.entity.Role;
import com.hcmus.FlashMart_API.domain.security.TokenGenerator;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil implements TokenGenerator {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    private SecretKey getSignKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractUsername(String token) {
        return extractEmail(token);
    }

    public Long extractUserId(String token) {
        return extractClaim(token, claims -> {
            Object userId = claims.get("userId");
            if (userId instanceof Number number) {
                return number.longValue();
            }
            return null;
        });
    }

    public Role extractRole(String token) {
        String roleStr = extractClaim(token, claims -> claims.get("role", String.class));
        if (roleStr != null) {
            try {
                return Role.valueOf(roleStr);
            } catch (IllegalArgumentException e) {
                return Role.USER;
            }
        }
        return Role.USER;
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public String generateToken(Long userId, String email, Role role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("role", role != null ? role.name() : Role.USER.name());

        return Jwts.builder()
                .claims(claims)
                .subject(email)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignKey())
                .compact();
    }

    public Boolean isExpiredToken(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Boolean isValidToken(String token) {
        try {
            return !isExpiredToken(token);
        } catch (Exception e) {
            return false;
        }
    }

    public Boolean isValidToken(String token, String email) {
        try {
            final String extractedEmail = extractEmail(token);
            return (extractedEmail.equals(email) && !isExpiredToken(token));
        } catch (Exception e) {
            return false;
        }
    }
}