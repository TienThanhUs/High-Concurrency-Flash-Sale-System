package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.entity.Product;
import com.hcmus.FlashMart_API.domain.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CreateProductUseCaseImpl implements CreateProductUseCase {
    private final ProductRepository repository;

    @Override
    @Transactional
    public Product execute(CreateProductCommand c) {
        Product product = Product.create(c.name(), c.description(), c.originalPrice(), c.generalStock());
        return repository.save(product);
    }
}
