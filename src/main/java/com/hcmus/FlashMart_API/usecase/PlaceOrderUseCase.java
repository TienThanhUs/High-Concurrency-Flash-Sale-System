package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.entity.OrderStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public interface PlaceOrderUseCase {
    record Result(
            UUID eventId,
            Long userId,
            UUID campaignItemId,
            OrderStatus status,
            LocalDateTime requestedAt
    ) {}

    Result execute(Long userId, UUID campaignItemId);
}
