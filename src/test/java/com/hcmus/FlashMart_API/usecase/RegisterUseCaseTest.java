package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.entity.Role;
import com.hcmus.FlashMart_API.domain.entity.User;
import com.hcmus.FlashMart_API.domain.repository.UserRepository;
import com.hcmus.FlashMart_API.infrastructure.security.JwtUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit Tests for RegisterUseCase")
class RegisterUseCaseTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private RegisterUsecaseImpl registerUseCase;

    private static final String VALID_USERNAME = "newUser123";
    private static final String VALID_EMAIL = "newuser@flashmart.com";
    private static final String VALID_RAW_PASSWORD = "rawPassword123";
    private static final String ENCODED_PASSWORD = "$2a$10$encodedPasswordHashHere";
    private static final String EXPECTED_JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy.token";

    @Nested
    @DisplayName("Registration Success Tests")
    class SuccessTests {

        @Test
        @DisplayName("Should register successfully, encode password, save user, and return JWT token")
        void shouldRegisterSuccessfully() {
            // Given
            when(userRepository.existsByEmail(VALID_EMAIL)).thenReturn(false);
            when(passwordEncoder.encode(VALID_RAW_PASSWORD)).thenReturn(ENCODED_PASSWORD);

            User savedUser = User.reconstruct(1L, VALID_USERNAME, VALID_EMAIL, ENCODED_PASSWORD, Role.USER);
            when(userRepository.save(any(User.class))).thenReturn(savedUser);
            when(jwtUtil.generateToken(1L, VALID_EMAIL, Role.USER)).thenReturn(EXPECTED_JWT_TOKEN);

            // When
            String resultToken = registerUseCase.execute(VALID_USERNAME, VALID_EMAIL, VALID_RAW_PASSWORD);

            // Then
            assertEquals(EXPECTED_JWT_TOKEN, resultToken);

            // Verify interactions
            verify(userRepository, times(1)).existsByEmail(VALID_EMAIL);
            verify(passwordEncoder, times(1)).encode(VALID_RAW_PASSWORD);

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository, times(1)).save(userCaptor.capture());
            User capturedUser = userCaptor.getValue();
            assertEquals(VALID_USERNAME, capturedUser.getUsername());
            assertEquals(VALID_EMAIL, capturedUser.getEmail());
            assertEquals(ENCODED_PASSWORD, capturedUser.getPassword());
            assertEquals(Role.USER, capturedUser.getRole());

            verify(jwtUtil, times(1)).generateToken(1L, VALID_EMAIL, Role.USER);
        }
    }

    @Nested
    @DisplayName("Registration Boundary & Failure Tests")
    class FailureAndEdgeCaseTests {

        @Test
        @DisplayName("Edge Case: Should throw RuntimeException when email already exists in repository")
        void shouldThrowExceptionWhenEmailAlreadyExists() {
            // Given
            when(userRepository.existsByEmail(VALID_EMAIL)).thenReturn(true);

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class, () ->
                    registerUseCase.execute(VALID_USERNAME, VALID_EMAIL, VALID_RAW_PASSWORD)
            );

            assertEquals("Email da ton tai !!!", exception.getMessage());

            // Ensure no further operations were performed
            verify(userRepository, times(1)).existsByEmail(VALID_EMAIL);
            verify(passwordEncoder, never()).encode(anyString());
            verify(userRepository, never()).save(any(User.class));
            verify(jwtUtil, never()).generateToken(any(), anyString(), any());
        }

        @Test
        @DisplayName("Boundary Case: Should fail when username length is 7 (< 8)")
        void shouldFailWhenUsernameIsShorterThan8() {
            String shortUsername = "short12"; // 7 characters
            when(userRepository.existsByEmail(VALID_EMAIL)).thenReturn(false);
            when(passwordEncoder.encode(VALID_RAW_PASSWORD)).thenReturn(ENCODED_PASSWORD);

            RuntimeException exception = assertThrows(RuntimeException.class, () ->
                    registerUseCase.execute(shortUsername, VALID_EMAIL, VALID_RAW_PASSWORD)
            );

            assertEquals("username is not valid", exception.getMessage());
            verify(userRepository, never()).save(any(User.class));
            verify(jwtUtil, never()).generateToken(any(), anyString(), any());
        }

        @Test
        @DisplayName("Edge Case: Should fail when email does not contain @ symbol")
        void shouldFailWhenEmailIsInvalid() {
            String invalidEmail = "invalidemailformat";
            when(userRepository.existsByEmail(invalidEmail)).thenReturn(false);
            when(passwordEncoder.encode(VALID_RAW_PASSWORD)).thenReturn(ENCODED_PASSWORD);

            RuntimeException exception = assertThrows(RuntimeException.class, () ->
                    registerUseCase.execute(VALID_USERNAME, invalidEmail, VALID_RAW_PASSWORD)
            );

            assertEquals("Email is not valid", exception.getMessage());
            verify(userRepository, never()).save(any(User.class));
            verify(jwtUtil, never()).generateToken(any(), anyString(), any());
        }

        @ParameterizedTest(name = "Password ''{0}'' should fail in RegisterUseCase")
        @NullAndEmptySource
        @ValueSource(strings = {"   ", "\t"})
        @DisplayName("Edge Case: Should fail when raw password is null, empty, or whitespace")
        void shouldFailWhenPasswordIsNullOrEmpty(String password) {
            RuntimeException exception = assertThrows(RuntimeException.class, () ->
                    registerUseCase.execute(VALID_USERNAME, VALID_EMAIL, password)
            );

            assertEquals("Password is not valid", exception.getMessage());
            verify(passwordEncoder, never()).encode(any());
            verify(userRepository, never()).save(any(User.class));
            verify(jwtUtil, never()).generateToken(any(), anyString(), any());
        }

        @ParameterizedTest(name = "Username ''{0}'' should fail in RegisterUseCase")
        @NullAndEmptySource
        @DisplayName("Edge Case: Should fail when username is null or empty")
        void shouldFailWhenUsernameIsNullOrEmpty(String username) {
            when(userRepository.existsByEmail(VALID_EMAIL)).thenReturn(false);
            when(passwordEncoder.encode(VALID_RAW_PASSWORD)).thenReturn(ENCODED_PASSWORD);

            RuntimeException exception = assertThrows(RuntimeException.class, () ->
                    registerUseCase.execute(username, VALID_EMAIL, VALID_RAW_PASSWORD)
            );

            assertEquals("username is not valid", exception.getMessage());
            verify(userRepository, never()).save(any(User.class));
            verify(jwtUtil, never()).generateToken(any(), anyString(), any());
        }

        @ParameterizedTest(name = "Email ''{0}'' should fail in RegisterUseCase")
        @NullAndEmptySource
        @DisplayName("Edge Case: Should fail when email is null or empty")
        void shouldFailWhenEmailIsNullOrEmpty(String email) {
            when(userRepository.existsByEmail(email)).thenReturn(false);
            when(passwordEncoder.encode(VALID_RAW_PASSWORD)).thenReturn(ENCODED_PASSWORD);

            RuntimeException exception = assertThrows(RuntimeException.class, () ->
                    registerUseCase.execute(VALID_USERNAME, email, VALID_RAW_PASSWORD)
            );

            assertEquals("Email is not valid", exception.getMessage());
            verify(userRepository, never()).save(any(User.class));
            verify(jwtUtil, never()).generateToken(any(), anyString(), any());
        }
    }
}
