package com.hcmus.FlashMart_API.domain.repository;

import com.hcmus.FlashMart_API.domain.entity.User;
import java.util.Optional;

public interface UserRepository {
    Optional<User> findByEmail(String email);
    User save(User user);
    Boolean existsByEmail(String email);
}
