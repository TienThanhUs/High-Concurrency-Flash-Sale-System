package com.hcmus.FlashMart_API.infrastructure.dto;

import com.hcmus.FlashMart_API.domain.entity.CampaignItem;

import java.math.BigDecimal;
import java.util.UUID;

public record CampaignItemResponse(
        UUID id,
        UUID campaignId,
        UUID productId,
        BigDecimal flashSalePrice,
        Integer totalQuantity,
        Integer availableQuantity
) {
    public static CampaignItemResponse from(CampaignItem item) {
        return new CampaignItemResponse(
                item.getId(),
                item.getCampaignId(),
                item.getProductId(),
                item.getFlashSalePrice(),
                item.getTotalQuantity(),
                item.getAvailableQuantity()
        );
    }
}
