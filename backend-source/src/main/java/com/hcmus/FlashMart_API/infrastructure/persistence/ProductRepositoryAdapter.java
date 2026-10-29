package com.hcmus.FlashMart_API.infrastructure.persistence;

import com.hcmus.FlashMart_API.domain.common.PagedResult;
import com.hcmus.FlashMart_API.domain.entity.Product;
import com.hcmus.FlashMart_API.domain.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ProductRepositoryAdapter implements ProductRepository {
    private final ProductJpaRepository productJpaRepository;
    private final ProductMapper productMapper;

    @Override
    public Product save(Product product) {
        ProductJpaEntity saved = productJpaRepository.save(productMapper.toJpaEntity(product));
        return productMapper.toDomain(saved);
    }

    @Override
    public Boolean existsByName(String name) {
        return productJpaRepository.existsByName(name);
    }

    @Override
    public List<Product> findAll() {
        return productJpaRepository.findAll().stream()
                .map(productMapper::toDomain)
                .toList();
    }

    @Override
    public PagedResult<Product> findPage(int page, int size) {
        Page<ProductJpaEntity> entityPage = productJpaRepository.findAll(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        List<Product> items = entityPage.getContent().stream()
                .map(productMapper::toDomain)
                .toList();
        return new PagedResult<>(
                items,
                entityPage.getNumber(),
                entityPage.getSize(),
                entityPage.getTotalElements(),
                entityPage.getTotalPages()
        );
    }

    @Override
    public Optional<Product> findById(UUID id) {
        return productJpaRepository.findById(id).map(productMapper::toDomain);
    }

    @Override
    public void deleteById(UUID id) {
        productJpaRepository.deleteById(id);
    }

    @Override
    public boolean existsById(UUID id) {
        return productJpaRepository.existsById(id);
    }
}
