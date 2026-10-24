package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.entity.Product;

public interface CreateProductUseCase {
    Product execute(CreateProductCommand command);
}
