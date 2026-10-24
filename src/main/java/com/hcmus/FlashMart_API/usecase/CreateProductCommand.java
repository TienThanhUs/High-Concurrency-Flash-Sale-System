package com.hcmus.FlashMart_API.usecase;

import java.math.BigDecimal;

public record CreateProductCommand(String name, String description, BigDecimal originalPrice, Integer generalStock) {
}
