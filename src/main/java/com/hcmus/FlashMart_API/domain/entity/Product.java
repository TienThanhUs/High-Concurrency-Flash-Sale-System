package com.hcmus.FlashMart_API.domain.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Catalog product. {@code generalStock} is the regular (non flash-sale) stock;
 * flash-sale stock lives in {@link CampaignItem} and is controlled by Redis.
 */
public class Product {
    private final UUID id;
    private String name;
    private String description;
    private BigDecimal originalPrice;
    private Integer generalStock;
    private final LocalDateTime createdAt;

    private Product(UUID id, String name, String description, BigDecimal originalPrice,
                    Integer generalStock, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.originalPrice = originalPrice;
        this.generalStock = generalStock;
        this.createdAt = createdAt;
    }

    public static Product create(String name, String description, BigDecimal originalPrice, Integer generalStock) {
        validateName(name);
        validateOriginalPrice(originalPrice);
        validateGeneralStock(generalStock);
        return new Product(null, name, description, originalPrice, generalStock, LocalDateTime.now());
    }

    /** Rebuild from persistence without re-validating. */
    public static Product restore(UUID id, String name, String description, BigDecimal originalPrice,
                                  Integer generalStock, LocalDateTime createdAt) {
        return new Product(id, name, description, originalPrice, generalStock, createdAt);
    }

    private static void validateName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Tên sản phẩm không được rỗng");
        }
    }

    private static void validateOriginalPrice(BigDecimal originalPrice) {
        if (originalPrice == null || originalPrice.signum() <= 0) {
            throw new IllegalArgumentException("Giá sản phẩm phải lớn hơn 0");
        }
    }

    private static void validateGeneralStock(Integer generalStock) {
        if (generalStock == null || generalStock < 0) {
            throw new IllegalArgumentException("Số lượng sản phẩm không thể nhỏ hơn 0");
        }
    }

    public void rename(String name) {
        validateName(name);
        this.name = name;
    }

    public void changePrice(BigDecimal originalPrice) {
        validateOriginalPrice(originalPrice);
        this.originalPrice = originalPrice;
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public BigDecimal getOriginalPrice() { return originalPrice; }
    public Integer getGeneralStock() { return generalStock; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
