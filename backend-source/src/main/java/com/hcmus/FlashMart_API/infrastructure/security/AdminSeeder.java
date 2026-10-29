package com.hcmus.FlashMart_API.infrastructure.security;

import com.hcmus.FlashMart_API.domain.entity.Role;
import com.hcmus.FlashMart_API.domain.entity.User;
import com.hcmus.FlashMart_API.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds initial ADMIN account from environment variables if configured and not yet present.
 * Never hardcodes credentials.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username:}")
    private String adminUsername;

    @Value("${app.admin.email:}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Override
    public void run(ApplicationArguments args) {
        if (adminEmail == null || adminEmail.isBlank()
                || adminPassword == null || adminPassword.isBlank()
                || adminUsername == null || adminUsername.isBlank()) {
            return;
        }
        if (Boolean.TRUE.equals(userRepository.existsByEmail(adminEmail))
                || userRepository.existsByUsername(adminUsername)) {
            return;
        }
        User admin = User.create(adminUsername, adminEmail, passwordEncoder.encode(adminPassword), Role.ADMIN);
        userRepository.save(admin);
        log.info("Seeded ADMIN user with email={}", adminEmail);
    }
}
