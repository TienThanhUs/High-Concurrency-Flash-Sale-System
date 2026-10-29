package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.entity.User;
import com.hcmus.FlashMart_API.domain.exception.ConflictException;
import com.hcmus.FlashMart_API.domain.repository.UserRepository;
import com.hcmus.FlashMart_API.domain.security.TokenGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RegisterUsecaseImpl implements RegisterUseCase {
    private final UserRepository repository;
    private final TokenGenerator tokenGenerator;
    private final PasswordEncoder encoder;

    @Override
    @Transactional
    public String execute(String username, String email, String password) {
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Password is not valid");
        }
        if (Boolean.TRUE.equals(repository.existsByEmail(email))) {
            throw new ConflictException("AUTH-001", "Email da ton tai !!!");
        }
        if (repository.existsByUsername(username)) {
            throw new ConflictException("AUTH-002", "Username da ton tai !!!");
        }
        User newUser = repository.save(User.create(username, email, encoder.encode(password)));
        return tokenGenerator.generateToken(newUser.getId(), newUser.getEmail(), newUser.getRole());
    }
}
