package com.hcmus.FlashMart_API.domain.entity;

import java.math.BigDecimal;
import java.util.UUID;

public class CampaignItem {
    private final UUID id;
    private final UUID campaignId;
    private final UUID productId;
    private final BigDecimal flashSalePrice;
    private final Integer totalQuantity;
    private final Integer availableQuantity;
    private final Integer version;

    private CampaignItem(UUID id, UUID campaignId, UUID productId, BigDecimal flashSalePrice,
                         Integer totalQuantity, Integer availableQuantity, Integer version) {
        this.id = id;
        this.campaignId = campaignId;
        this.productId = productId;
        this.flashSalePrice = flashSalePrice;
        this.totalQuantity = totalQuantity;
        this.availableQuantity = availableQuantity;
        this.version = version != null ? version : 0;
    }

    public static CampaignItem create(UUID campaignId, UUID productId, BigDecimal flashSalePrice, Integer totalQuantity) {
        if (campaignId == null) {
            throw new IllegalArgumentException("Campaign ID không được để trống");
        }
        if (productId == null) {
            throw new IllegalArgumentException("Product ID không được để trống");
        }
        if (flashSalePrice == null || flashSalePrice.signum() <= 0) {
            throw new IllegalArgumentException("Giá flash sale phải lớn hơn 0");
        }
        if (totalQuantity == null || totalQuantity <= 0) {
            throw new IllegalArgumentException("Số lượng flash sale phải lớn hơn 0");
        }
        return new CampaignItem(null, campaignId, productId, flashSalePrice, totalQuantity, totalQuantity, 0);
    }

    public static CampaignItem restore(UUID id, UUID campaignId, UUID productId, BigDecimal flashSalePrice,
                                       Integer totalQuantity, Integer availableQuantity, Integer version) {
        return new CampaignItem(id, campaignId, productId, flashSalePrice, totalQuantity, availableQuantity, version);
    }

    public UUID getId() { return id; }
    public UUID getCampaignId() { return campaignId; }
    public UUID getProductId() { return productId; }
    public BigDecimal getFlashSalePrice() { return flashSalePrice; }
    public Integer getTotalQuantity() { return totalQuantity; }
    public Integer getAvailableQuantity() { return availableQuantity; }
    public Integer getVersion() { return version; }
}
