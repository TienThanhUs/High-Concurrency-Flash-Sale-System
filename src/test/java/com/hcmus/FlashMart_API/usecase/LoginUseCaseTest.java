package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.entity.Role;
import com.hcmus.FlashMart_API.domain.entity.User;
import com.hcmus.FlashMart_API.domain.exception.UnauthorizedException;
import com.hcmus.FlashMart_API.domain.repository.UserRepository;
import com.hcmus.FlashMart_API.domain.security.TokenGenerator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LoginUseCaseTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock TokenGenerator tokenGenerator;
    @InjectMocks LoginUseCaseImpl loginUseCase;

    @Test
    @DisplayName("Valid email and password returns JWT")
    void login_success() {
        User u = User.reconstruct(5L, "validUser", "u@flashmart.com", "hashed", Role.USER);
        when(userRepository.findByEmail("u@flashmart.com")).thenReturn(Optional.of(u));
        when(passwordEncoder.matches("rawPass", "hashed")).thenReturn(true);
        when(tokenGenerator.generateToken(5L, "u@flashmart.com", Role.USER)).thenReturn("jwt.token");

        assertEquals("jwt.token", loginUseCase.execute("u@flashmart.com", "rawPass"));
    }

    @Test
    @DisplayName("Wrong password throws UnauthorizedException")
    void login_wrongPassword() {
        User u = User.reconstruct(5L, "validUser", "u@flashmart.com", "hashed", Role.USER);
        when(userRepository.findByEmail("u@flashmart.com")).thenReturn(Optional.of(u));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> loginUseCase.execute("u@flashmart.com", "wrong"));
    }
}
