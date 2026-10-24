package com.hcmus.FlashMart_API.infrastructure.dto;

import com.hcmus.FlashMart_API.domain.entity.Product;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record ProductResponse(UUID id, String name, String description, BigDecimal originalPrice,
                              Integer generalStock, LocalDateTime createdAt) {
    public static ProductResponse from(Product p) {
        return new ProductResponse(p.getId(), p.getName(), p.getDescription(),
                p.getOriginalPrice(), p.getGeneralStock(), p.getCreatedAt());
    }
}
