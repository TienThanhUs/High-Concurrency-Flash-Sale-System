package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.entity.User;

public interface RegisterUseCase {
    String execute(String username,String email,String password);
}
