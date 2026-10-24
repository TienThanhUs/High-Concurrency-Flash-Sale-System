package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.entity.Order;

import java.util.List;

public interface GetMyOrdersUseCase {
    List<Order> execute(Long userId);
}
