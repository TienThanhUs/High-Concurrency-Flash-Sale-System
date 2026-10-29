package com.hcmus.FlashMart_API.domain.entity;

public class User {
    private Long id;
    private String username;
    private String email;
    private String password;
    private Role role;
    private User(Long id, String username, String email, String password, Role role) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role != null ? role : Role.USER;
    }

    private User(String username, String email, String password, Role role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role != null ? role : Role.USER;
    }

    public static User create(String username, String email, String password) {
        return create(username, email, password, Role.USER);
    }

    public static User create(String username, String email, String password, Role role) {
        if (username == null || username.length() < 8) {
            throw new RuntimeException("username is not valid");
        }
        if (email == null || !email.contains("@")) {
            throw new RuntimeException("Email is not valid");
        }
        if (password == null || password.isBlank()) {
            throw new RuntimeException("Password is not valid");
        }
        return new User(username, email, password, role);
    }

    public static User reconstruct(Long id, String username, String email, String password, Role role) {
        return new User(id, username, email, password, role);
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public Role getRole() {
        return role;
    }
}
