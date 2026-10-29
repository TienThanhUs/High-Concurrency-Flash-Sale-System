package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.entity.User;
import com.hcmus.FlashMart_API.domain.exception.UnauthorizedException;
import com.hcmus.FlashMart_API.domain.repository.UserRepository;
import com.hcmus.FlashMart_API.domain.security.TokenGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LoginUseCaseImpl implements LoginUseCase {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenGenerator tokenGenerator;

    @Override
    @Transactional(readOnly = true)
    public String execute(String email, String password) {
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            throw new UnauthorizedException("Email hoac mat khau khong dung");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Email hoac mat khau khong dung"));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new UnauthorizedException("Email hoac mat khau khong dung");
        }
        return tokenGenerator.generateToken(user.getId(), user.getEmail(), user.getRole());
    }
}
