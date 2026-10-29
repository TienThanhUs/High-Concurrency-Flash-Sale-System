package com.hcmus.FlashMart_API.infrastructure.dto;

import com.hcmus.FlashMart_API.domain.entity.Order;
import com.hcmus.FlashMart_API.domain.entity.OrderStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record OrderResponse(
        Long id,
        Long userId,
        UUID campaignItemId,
        OrderStatus status,
        LocalDateTime createdAt
) {
    public static OrderResponse from(Order o) {
        return new OrderResponse(o.getId(), o.getUserId(), o.getCampaignItemId(), o.getStatus(), o.getCreatedAt());
    }
}
