package com.hcmus.FlashMart_API.domain.event;

public interface OrderEventPublisher {
    void publishOrderCreated(OrderCreatedEvent event);
}
