package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.event.OrderCreatedEvent;

public interface ProcessOrderCreatedEventUseCase {
    void execute(OrderCreatedEvent event);
}
