package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.entity.Order;
import com.hcmus.FlashMart_API.domain.entity.Role;

public interface GetOrderByIdUseCase {
    Order execute(Long orderId, Long requesterId, Role requesterRole);
}
