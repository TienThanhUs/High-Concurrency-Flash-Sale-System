package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.entity.Campaign;
import com.hcmus.FlashMart_API.domain.entity.CampaignItem;
import com.hcmus.FlashMart_API.domain.entity.CampaignStatus;
import com.hcmus.FlashMart_API.domain.entity.OrderStatus;
import com.hcmus.FlashMart_API.domain.event.OrderEventPublisher;
import com.hcmus.FlashMart_API.domain.exception.ConflictException;
import com.hcmus.FlashMart_API.domain.repository.CampaignItemRepository;
import com.hcmus.FlashMart_API.domain.repository.CampaignRepository;
import com.hcmus.FlashMart_API.domain.repository.FlashSaleInventoryPort;
import com.hcmus.FlashMart_API.domain.repository.FlashSaleInventoryPort.ReservationStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlaceOrderUseCaseTest {

    @Mock CampaignItemRepository campaignItemRepository;
    @Mock CampaignRepository campaignRepository;
    @Mock FlashSaleInventoryPort inventoryPort;
    @Mock ReconcileInventoryUseCase reconcileInventoryUseCase;
    @Mock OrderEventPublisher orderEventPublisher;

    @InjectMocks PlaceOrderUseCaseImpl placeOrderUseCase;

    private UUID campaignId;
    private UUID itemId;
    private Campaign activeCampaign;
    private CampaignItem item;

    @BeforeEach
    void setUp() {
        campaignId = UUID.randomUUID();
        itemId = UUID.randomUUID();
        activeCampaign = Campaign.restore(
                campaignId,
                "Flash Deal",
                LocalDateTime.now().minusMinutes(10),
                LocalDateTime.now().plusMinutes(20),
                CampaignStatus.ACTIVE,
                LocalDateTime.now()
        );
        item = CampaignItem.restore(itemId, campaignId, UUID.randomUUID(), BigDecimal.valueOf(100000), 10, 10, 0);
    }

    @Test
    @DisplayName("Reserve OK -> publishes Kafka event and returns PENDING")
    void placeOrder_ok() {
        when(campaignItemRepository.findById(itemId)).thenReturn(Optional.of(item));
        when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(activeCampaign));
        when(inventoryPort.tryReserve(itemId, 99L)).thenReturn(ReservationStatus.OK);

        PlaceOrderUseCase.Result res = placeOrderUseCase.execute(99L, itemId);

        assertEquals(OrderStatus.PENDING, res.status());
        verify(orderEventPublisher).publishOrderCreated(any());
        verify(inventoryPort, never()).releaseReservation(any(), any());
    }

    @Test
    @DisplayName("Out of stock -> throws ConflictException ORD-001")
    void placeOrder_outOfStock() {
        when(campaignItemRepository.findById(itemId)).thenReturn(Optional.of(item));
        when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(activeCampaign));
        when(inventoryPort.tryReserve(itemId, 99L)).thenReturn(ReservationStatus.OUT_OF_STOCK);

        ConflictException ex = assertThrows(ConflictException.class, () -> placeOrderUseCase.execute(99L, itemId));
        assertEquals("ORD-001", ex.getErrorCode());
        verifyNoInteractions(orderEventPublisher);
    }

    @Test
    @DisplayName("Already purchased -> throws ConflictException ORD-002")
    void placeOrder_alreadyPurchased() {
        when(campaignItemRepository.findById(itemId)).thenReturn(Optional.of(item));
        when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(activeCampaign));
        when(inventoryPort.tryReserve(itemId, 99L)).thenReturn(ReservationStatus.ALREADY_PURCHASED);

        ConflictException ex = assertThrows(ConflictException.class, () -> placeOrderUseCase.execute(99L, itemId));
        assertEquals("ORD-002", ex.getErrorCode());
        verifyNoInteractions(orderEventPublisher);
    }

    @Test
    @DisplayName("Kafka publish failure triggers Redis compensation (releaseReservation)")
    void placeOrder_kafkaFailureCompensatesRedis() {
        when(campaignItemRepository.findById(itemId)).thenReturn(Optional.of(item));
        when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(activeCampaign));
        when(inventoryPort.tryReserve(itemId, 99L)).thenReturn(ReservationStatus.OK);
        doThrow(new IllegalStateException("Kafka down")).when(orderEventPublisher).publishOrderCreated(any());

        assertThrows(IllegalStateException.class, () -> placeOrderUseCase.execute(99L, itemId));
        verify(inventoryPort).releaseReservation(itemId, 99L);
    }

    @Test
    @DisplayName("Missing Redis key triggers auto-reconcile then reserves successfully")
    void placeOrder_reconcilesWhenKeyMissing() {
        when(campaignItemRepository.findById(itemId)).thenReturn(Optional.of(item));
        when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(activeCampaign));
        when(inventoryPort.tryReserve(itemId, 99L))
                .thenReturn(ReservationStatus.STOCK_NOT_INITIALIZED)
                .thenReturn(ReservationStatus.OK);

        PlaceOrderUseCase.Result res = placeOrderUseCase.execute(99L, itemId);

        assertEquals(OrderStatus.PENDING, res.status());
        verify(reconcileInventoryUseCase).reconcileItem(itemId);
        verify(orderEventPublisher).publishOrderCreated(any());
    }
}
