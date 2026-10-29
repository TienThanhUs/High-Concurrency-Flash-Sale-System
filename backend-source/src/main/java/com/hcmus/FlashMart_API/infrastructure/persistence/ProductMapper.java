package com.hcmus.FlashMart_API.infrastructure.persistence;

import com.hcmus.FlashMart_API.domain.entity.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {
    public Product toDomain(ProductJpaEntity e) {
        return Product.restore(e.getId(), e.getName(), e.getDescription(),
                e.getOriginalPrice(), e.getGeneralStock(), e.getCreatedAt());
    }

    public ProductJpaEntity toJpaEntity(Product p) {
        ProductJpaEntity e = new ProductJpaEntity();
        e.setId(p.getId());
        e.setName(p.getName());
        e.setDescription(p.getDescription());
        e.setOriginalPrice(p.getOriginalPrice());
        e.setGeneralStock(p.getGeneralStock());
        e.setCreatedAt(p.getCreatedAt());
        return e;
    }
}
