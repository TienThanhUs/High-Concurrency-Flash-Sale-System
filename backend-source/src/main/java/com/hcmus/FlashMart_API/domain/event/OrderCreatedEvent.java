package com.hcmus.FlashMart_API.domain.event;

import java.time.LocalDateTime;
import java.util.UUID;

public record OrderCreatedEvent(
        UUID eventId,
        Long userId,
        UUID campaignItemId,
        LocalDateTime requestedAt
) {
}
