package com.hcmus.FlashMart_API.infrastructure.dto;

import com.hcmus.FlashMart_API.domain.entity.OrderStatus;
import com.hcmus.FlashMart_API.usecase.PlaceOrderUseCase;

import java.time.LocalDateTime;
import java.util.UUID;

public record PlaceOrderResponse(
        UUID eventId,
        Long userId,
        UUID campaignItemId,
        OrderStatus status,
        LocalDateTime requestedAt
) {
    public static PlaceOrderResponse from(PlaceOrderUseCase.Result r) {
        return new PlaceOrderResponse(r.eventId(), r.userId(), r.campaignItemId(), r.status(), r.requestedAt());
    }
}
