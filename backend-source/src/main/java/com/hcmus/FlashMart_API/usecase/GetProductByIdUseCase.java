package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.entity.Product;

import java.util.UUID;

public interface GetProductByIdUseCase {
    Product execute(UUID id);
}
