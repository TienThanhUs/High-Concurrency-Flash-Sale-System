package com.hcmus.FlashMart_API.domain.repository;

import com.hcmus.FlashMart_API.domain.common.PagedResult;
import com.hcmus.FlashMart_API.domain.entity.Product;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository {
    Product save(Product product);
    Boolean existsByName(String name);
    List<Product> findAll();
    PagedResult<Product> findPage(int page, int size);
    Optional<Product> findById(UUID id);
    void deleteById(UUID id);
    boolean existsById(UUID id);
}
