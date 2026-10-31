package com.hcmus.FlashMart_API.infrastructure.messaging;

import com.hcmus.FlashMart_API.domain.event.OrderCreatedEvent;
import com.hcmus.FlashMart_API.domain.event.OrderEventPublisher;
import com.hcmus.FlashMart_API.usecase.ProcessOrderCreatedEventUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

/**
 * Fallback asynchronous order event publisher when running on free cloud tiers without a Kafka broker
 * (activated via KAFKA_ENABLED=false).
 */
@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.kafka.enabled", havingValue = "false")
public class InMemoryAsyncOrderEventPublisher implements OrderEventPublisher {

    private final ProcessOrderCreatedEventUseCase processOrderCreatedEventUseCase;

    @Override
    public void publishOrderCreated(OrderCreatedEvent event) {
        CompletableFuture.runAsync(() -> {
            try {
                processOrderCreatedEventUseCase.execute(event);
            } catch (Exception e) {
                log.error("Failed to process async order event in-memory: eventId={}", event.eventId(), e);
            }
        });
    }
}
