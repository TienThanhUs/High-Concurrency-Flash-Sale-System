package com.hcmus.FlashMart_API.infrastructure.messaging;

import com.hcmus.FlashMart_API.domain.event.OrderCreatedEvent;
import com.hcmus.FlashMart_API.usecase.ProcessOrderCreatedEventUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderCreatedKafkaConsumer {

    private final ProcessOrderCreatedEventUseCase processOrderCreatedEventUseCase;
    private final JsonMapper jsonMapper = JsonMapper.builder().build();

    @KafkaListener(
            topics = "${app.kafka.order-created-topic:flashmart.order-created}",
            groupId = "${spring.kafka.consumer.group-id:flashmart-order-group}"
    )
    public void onMessage(String payload) {
        OrderCreatedEvent event = jsonMapper.readValue(payload, OrderCreatedEvent.class);
        processOrderCreatedEventUseCase.execute(event);
    }
}
