package com.hcmus.FlashMart_API.infrastructure.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public record AddCampaignItemRequest(
        @NotNull UUID productId,
        @NotNull @Positive @Digits(integer = 8, fraction = 2) BigDecimal flashSalePrice,
        @NotNull @Positive Integer totalQuantity
) {
}
