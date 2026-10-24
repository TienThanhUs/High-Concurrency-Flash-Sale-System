package com.hcmus.FlashMart_API.infrastructure.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record CreateProductRequest(
        @NotBlank @Size(max = 255) String name,
        String description,
        @NotNull @Positive @Digits(integer = 8, fraction = 2) BigDecimal originalPrice,
        @NotNull @PositiveOrZero Integer generalStock
) {
}
