package com.hcmus.FlashMart_API.domain.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Unit Tests for User Domain Entity")
class UserTest {

    @Nested
    @DisplayName("Happy Path Tests")
    class HappyPathTests {

        @Test
        @DisplayName("Should create user successfully with valid inputs and default USER role")
        void shouldCreateUserSuccessfullyWithDefaultRole() {
            User user = User.create("validUser123", "test@flashmart.com", "securePassword123");

            assertNotNull(user);
            assertEquals("validUser123", user.getUsername());
            assertEquals("test@flashmart.com", user.getEmail());
            assertEquals("securePassword123", user.getPassword());
            assertEquals(Role.USER, user.getRole());
            assertNull(user.getId());
        }

        @Test
        @DisplayName("Should create user successfully with explicit ADMIN role")
        void shouldCreateUserSuccessfullyWithAdminRole() {
            User user = User.create("adminUser123", "admin@flashmart.com", "adminPassword123", Role.ADMIN);

            assertNotNull(user);
            assertEquals("adminUser123", user.getUsername());
            assertEquals("admin@flashmart.com", user.getEmail());
            assertEquals(Role.ADMIN, user.getRole());
        }

        @Test
        @DisplayName("Should reconstruct existing user from database with all attributes intact")
        void shouldReconstructUserSuccessfully() {
            User user = User.reconstruct(100L, "existingUser", "exist@flashmart.com", "hashedPassword", Role.ADMIN);

            assertNotNull(user);
            assertEquals(100L, user.getId());
            assertEquals("existingUser", user.getUsername());
            assertEquals("exist@flashmart.com", user.getEmail());
            assertEquals("hashedPassword", user.getPassword());
            assertEquals(Role.ADMIN, user.getRole());
        }

        @Test
        @DisplayName("Should fallback to Role.USER if reconstruct is passed null role")
        void shouldFallbackToUserRoleWhenReconstructedRoleIsNull() {
            User user = User.reconstruct(101L, "existingUser", "exist@flashmart.com", "hashedPassword", null);

            assertEquals(Role.USER, user.getRole());
        }
    }

    @Nested
    @DisplayName("Username Boundary & Edge Case Tests")
    class UsernameEdgeCaseTests {

        @ParameterizedTest(name = "Username ''{0}'' should throw RuntimeException")
        @NullAndEmptySource
        @DisplayName("Should throw exception when username is null or empty")
        void shouldThrowExceptionWhenUsernameIsNullOrEmpty(String username) {
            RuntimeException exception = assertThrows(RuntimeException.class, () ->
                    User.create(username, "test@flashmart.com", "password123")
            );
            assertEquals("username is not valid", exception.getMessage());
        }

        @Test
        @DisplayName("Boundary test: Username with length 7 (just below threshold 8) should fail")
        void shouldThrowExceptionWhenUsernameLengthIs7() {
            String length7Username = "1234567";
            RuntimeException exception = assertThrows(RuntimeException.class, () ->
                    User.create(length7Username, "test@flashmart.com", "password123")
            );
            assertEquals("username is not valid", exception.getMessage());
        }

        @Test
        @DisplayName("Boundary test: Username with length exactly 8 should succeed")
        void shouldSucceedWhenUsernameLengthIsExactly8() {
            String length8Username = "12345678";
            User user = User.create(length8Username, "test@flashmart.com", "password123");

            assertNotNull(user);
            assertEquals(8, user.getUsername().length());
        }

        @Test
        @DisplayName("Boundary test: Username with length 9 should succeed")
        void shouldSucceedWhenUsernameLengthIs9() {
            String length9Username = "123456789";
            User user = User.create(length9Username, "test@flashmart.com", "password123");

            assertNotNull(user);
            assertEquals(9, user.getUsername().length());
        }
    }

    @Nested
    @DisplayName("Email Boundary & Edge Case Tests")
    class EmailEdgeCaseTests {

        @ParameterizedTest(name = "Email ''{0}'' should throw RuntimeException")
        @NullAndEmptySource
        @DisplayName("Should throw exception when email is null or empty")
        void shouldThrowExceptionWhenEmailIsNullOrEmpty(String email) {
            RuntimeException exception = assertThrows(RuntimeException.class, () ->
                    User.create("validUser123", email, "password123")
            );
            assertEquals("Email is not valid", exception.getMessage());
        }

        @ParameterizedTest(name = "Email without @: ''{0}'' should fail")
        @ValueSource(strings = {"invalidemail.com", "user.flashmart.vn", "plainaddress", "   "})
        @DisplayName("Should throw exception when email does not contain '@'")
        void shouldThrowExceptionWhenEmailDoesNotContainAtSymbol(String email) {
            RuntimeException exception = assertThrows(RuntimeException.class, () ->
                    User.create("validUser123", email, "password123")
            );
            assertEquals("Email is not valid", exception.getMessage());
        }

        @Test
        @DisplayName("Boundary test: Minimal email containing '@' should succeed")
        void shouldSucceedWhenEmailContainsAtSymbol() {
            User user = User.create("validUser123", "a@b", "password123");

            assertNotNull(user);
            assertEquals("a@b", user.getEmail());
        }
    }

    @Nested
    @DisplayName("Password Boundary & Edge Case Tests")
    class PasswordEdgeCaseTests {

        @ParameterizedTest(name = "Password ''{0}'' should throw RuntimeException")
        @NullAndEmptySource
        @ValueSource(strings = {"   ", "\t", "\n"})
        @DisplayName("Should throw exception when password is null, empty, or whitespace")
        void shouldThrowExceptionWhenPasswordIsBlank(String password) {
            RuntimeException exception = assertThrows(RuntimeException.class, () ->
                    User.create("validUser123", "test@flashmart.com", password)
            );
            assertEquals("Password is not valid", exception.getMessage());
        }

        @Test
        @DisplayName("Should succeed when password is valid non-blank string")
        void shouldSucceedWhenPasswordIsValid() {
            User user = User.create("validUser123", "test@flashmart.com", "p");

            assertNotNull(user);
            assertEquals("p", user.getPassword());
        }
    }
}
