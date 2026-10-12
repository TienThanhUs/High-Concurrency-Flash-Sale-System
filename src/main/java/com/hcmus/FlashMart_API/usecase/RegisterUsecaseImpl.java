package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.entity.User;
import com.hcmus.FlashMart_API.domain.repository.UserRepository;
import com.hcmus.FlashMart_API.infrastructure.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RegisterUsecaseImpl implements RegisterUseCase {
    private final UserRepository repository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder encoder;


    @Override
    public String execute(String username, String email, String password) {
        if (password == null || password.isBlank()) {
            throw new RuntimeException("Password is not valid");
        }
        if (repository.existsByEmail(email)) {
            throw new RuntimeException("Email da ton tai !!!");
        }
        User newUser = repository.save(User.create(username, email, encoder.encode(password)));
        return jwtUtil.generateToken(newUser.getId(), newUser.getEmail(), newUser.getRole());
    }
}
