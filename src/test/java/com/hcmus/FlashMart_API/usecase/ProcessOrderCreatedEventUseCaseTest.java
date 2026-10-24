package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.entity.Order;
import com.hcmus.FlashMart_API.domain.entity.OrderStatus;
import com.hcmus.FlashMart_API.domain.event.OrderCreatedEvent;
import com.hcmus.FlashMart_API.domain.repository.CampaignItemRepository;
import com.hcmus.FlashMart_API.domain.repository.FlashSaleInventoryPort;
import com.hcmus.FlashMart_API.domain.repository.OrderRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProcessOrderCreatedEventUseCaseTest {

    @Mock OrderRepository orderRepository;
    @Mock CampaignItemRepository campaignItemRepository;
    @Mock FlashSaleInventoryPort inventoryPort;
    @InjectMocks ProcessOrderCreatedEventUseCaseImpl useCase;

    @Test
    @DisplayName("Idempotent: skips when confirmed order already exists")
    void idempotentSkipWhenAlreadyExists() {
        UUID itemId = UUID.randomUUID();
        Order existing = Order.restore(1L, 10L, itemId, OrderStatus.CONFIRMED, LocalDateTime.now());
        when(orderRepository.findByUserIdAndCampaignItemId(10L, itemId)).thenReturn(Optional.of(existing));

        useCase.execute(new OrderCreatedEvent(UUID.randomUUID(), 10L, itemId, LocalDateTime.now()));

        verify(campaignItemRepository, never()).decrementAvailableQuantity(any());
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Decrements stock and saves confirmed order on first event")
    void savesConfirmedOrder() {
        UUID itemId = UUID.randomUUID();
        when(orderRepository.findByUserIdAndCampaignItemId(10L, itemId)).thenReturn(Optional.empty());
        when(campaignItemRepository.decrementAvailableQuantity(itemId)).thenReturn(1);

        useCase.execute(new OrderCreatedEvent(UUID.randomUUID(), 10L, itemId, LocalDateTime.now()));

        verify(campaignItemRepository).decrementAvailableQuantity(itemId);
        verify(orderRepository).save(any(Order.class));
    }
}
