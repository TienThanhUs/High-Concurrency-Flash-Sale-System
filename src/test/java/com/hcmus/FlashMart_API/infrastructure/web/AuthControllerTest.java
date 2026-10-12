package com.hcmus.FlashMart_API.infrastructure.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hcmus.FlashMart_API.infrastructure.dto.RegisterRequest;
import com.hcmus.FlashMart_API.usecase.RegisterUseCase;
import jakarta.servlet.ServletException;
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

import static org.junit.jupiter.api.Assertions.*;
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

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
    }

    @Nested
    @DisplayName("POST /api/v1/auth/register Tests")
    class RegisterEndpointTests {

        @Test
        @DisplayName("Should return 200 OK and JWT response on successful registration")
        void shouldReturn200AndJwtResponseOnSuccess() throws Exception {
            // Given
            RegisterRequest request = new RegisterRequest("testuser123", "test@flashmart.com", "password123");
            String mockJwt = "mocked.jwt.token.string";

            when(registerUseCase.execute("testuser123", "test@flashmart.com", "password123"))
                    .thenReturn(mockJwt);

            // When & Then
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
        @DisplayName("Should throw exception when register usecase throws duplicate email error")
        void shouldPropagateExceptionWhenEmailAlreadyExists() throws Exception {
            // Given
            RegisterRequest request = new RegisterRequest("testuser123", "existing@flashmart.com", "password123");

            when(registerUseCase.execute("testuser123", "existing@flashmart.com", "password123"))
                    .thenThrow(new RuntimeException("Email da ton tai !!!"));

            // When & Then
            ServletException exception = assertThrows(ServletException.class, () ->
                    mockMvc.perform(post("/api/v1/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
            );

            assertInstanceOf(RuntimeException.class, exception.getCause());
            assertEquals("Email da ton tai !!!", exception.getCause().getMessage());

            verify(registerUseCase, times(1))
                    .execute("testuser123", "existing@flashmart.com", "password123");
        }

        @Test
        @DisplayName("Should propagate exception when request body has null or empty fields")
        void shouldPropagateExceptionWhenFieldsAreNullOrEmpty() throws Exception {
            // Given: null/empty inputs
            RegisterRequest request = new RegisterRequest(null, "", null);

            when(registerUseCase.execute(null, "", null))
                    .thenThrow(new RuntimeException("Password is not valid"));

            // When & Then
            ServletException exception = assertThrows(ServletException.class, () ->
                    mockMvc.perform(post("/api/v1/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
            );

            assertInstanceOf(RuntimeException.class, exception.getCause());
            assertEquals("Password is not valid", exception.getCause().getMessage());
        }
    }
}
