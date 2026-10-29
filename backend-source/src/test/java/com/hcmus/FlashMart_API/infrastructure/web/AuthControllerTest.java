package com.hcmus.FlashMart_API.infrastructure.web;

import com.hcmus.FlashMart_API.domain.exception.ConflictException;
import com.hcmus.FlashMart_API.domain.exception.UnauthorizedException;
import com.hcmus.FlashMart_API.infrastructure.dto.AuthenticationRequest;
import com.hcmus.FlashMart_API.infrastructure.dto.RegisterRequest;
import com.hcmus.FlashMart_API.usecase.LoginUseCase;
import com.hcmus.FlashMart_API.usecase.RegisterUseCase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tools.jackson.databind.ObjectMapper;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit Tests for AuthController")
class AuthControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private RegisterUseCase registerUseCase;

    @Mock
    private LoginUseCase loginUseCase;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Nested
    @DisplayName("POST /api/v1/auth/register Tests")
    class RegisterEndpointTests {

        @Test
        @DisplayName("Should return 200 OK and JWT response on successful registration")
        void shouldReturn200AndJwtResponseOnSuccess() throws Exception {
            RegisterRequest request = new RegisterRequest("testuser123", "test@flashmart.com", "password123");
            String mockJwt = "mocked.jwt.token.string";

            when(registerUseCase.execute("testuser123", "test@flashmart.com", "password123"))
                    .thenReturn(mockJwt);

            mockMvc.perform(post("/api/v1/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.jwt").value(mockJwt));

            verify(registerUseCase, times(1))
                    .execute("testuser123", "test@flashmart.com", "password123");
        }

        @Test
        @DisplayName("Should return 409 Conflict when register usecase throws duplicate email error")
        void shouldReturn409WhenEmailAlreadyExists() throws Exception {
            RegisterRequest request = new RegisterRequest("testuser123", "existing@flashmart.com", "password123");

            when(registerUseCase.execute("testuser123", "existing@flashmart.com", "password123"))
                    .thenThrow(new ConflictException("AUTH-001", "Email da ton tai !!!"));

            mockMvc.perform(post("/api/v1/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.errorCode").value("AUTH-001"))
                    .andExpect(jsonPath("$.message").value("Email da ton tai !!!"));

            verify(registerUseCase, times(1))
                    .execute("testuser123", "existing@flashmart.com", "password123");
        }

        @Test
        @DisplayName("Should return 400 Bad Request when request body has null or empty fields")
        void shouldReturn400WhenFieldsAreNullOrEmpty() throws Exception {
            RegisterRequest request = new RegisterRequest(null, "", null);

            mockMvc.perform(post("/api/v1/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errorCode").value("VAL-001"));

            verifyNoInteractions(registerUseCase);
        }
    }

    @Nested
    @DisplayName("POST /api/v1/auth/login Tests")
    class LoginEndpointTests {

        @Test
        @DisplayName("Should return 200 OK and JWT response on valid credentials")
        void shouldReturn200OnValidLogin() throws Exception {
            AuthenticationRequest request = new AuthenticationRequest("test@flashmart.com", "password123");
            when(loginUseCase.execute("test@flashmart.com", "password123")).thenReturn("login.jwt.token");

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.jwt").value("login.jwt.token"));
        }

        @Test
        @DisplayName("Should return 401 Unauthorized on invalid credentials")
        void shouldReturn401OnInvalidLogin() throws Exception {
            AuthenticationRequest request = new AuthenticationRequest("test@flashmart.com", "wrong");
            when(loginUseCase.execute("test@flashmart.com", "wrong"))
                    .thenThrow(new UnauthorizedException("Email hoac mat khau khong dung"));

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.errorCode").value("AUTH-401"));
        }
    }
}
