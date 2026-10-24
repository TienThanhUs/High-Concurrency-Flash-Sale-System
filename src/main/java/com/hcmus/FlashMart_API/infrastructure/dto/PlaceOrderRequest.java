package com.hcmus.FlashMart_API.infrastructure.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record PlaceOrderRequest(
        @NotNull UUID campaignItemId
) {
}
