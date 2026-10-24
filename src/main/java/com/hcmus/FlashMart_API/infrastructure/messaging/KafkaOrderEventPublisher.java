package com.hcmus.FlashMart_API.infrastructure.messaging;

import com.hcmus.FlashMart_API.domain.event.OrderCreatedEvent;
import com.hcmus.FlashMart_API.domain.event.OrderEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class KafkaOrderEventPublisher implements OrderEventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final JsonMapper jsonMapper = JsonMapper.builder().build();

    @Value("${app.kafka.order-created-topic:flashmart.order-created}")
    private String orderCreatedTopic;

    @Override
    public void publishOrderCreated(OrderCreatedEvent event) {
        try {
            String key = event.campaignItemId().toString();
            String payload = jsonMapper.writeValueAsString(event);
            kafkaTemplate.send(orderCreatedTopic, key, payload).get(5, TimeUnit.SECONDS);
        } catch (Exception e) {
            throw new IllegalStateException("Không thể gửi sự kiện đặt hàng lên Kafka", e);
        }
    }
}
