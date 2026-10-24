package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.entity.Campaign;
import com.hcmus.FlashMart_API.domain.entity.CampaignItem;
import com.hcmus.FlashMart_API.domain.entity.OrderStatus;
import com.hcmus.FlashMart_API.domain.event.OrderCreatedEvent;
import com.hcmus.FlashMart_API.domain.event.OrderEventPublisher;
import com.hcmus.FlashMart_API.domain.exception.ConflictException;
import com.hcmus.FlashMart_API.domain.exception.ResourceNotFoundException;
import com.hcmus.FlashMart_API.domain.repository.CampaignItemRepository;
import com.hcmus.FlashMart_API.domain.repository.CampaignRepository;
import com.hcmus.FlashMart_API.domain.repository.FlashSaleInventoryPort;
import com.hcmus.FlashMart_API.domain.repository.FlashSaleInventoryPort.ReservationStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlaceOrderUseCaseImpl implements PlaceOrderUseCase {

    private final CampaignItemRepository campaignItemRepository;
    private final CampaignRepository campaignRepository;
    private final FlashSaleInventoryPort inventoryPort;
    private final ReconcileInventoryUseCase reconcileInventoryUseCase;
    private final OrderEventPublisher orderEventPublisher;

    @Override
    public Result execute(Long userId, UUID campaignItemId) {
        CampaignItem item = campaignItemRepository.findById(campaignItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tồn tại sản phẩm flash sale: " + campaignItemId));

        Campaign campaign = campaignRepository.findById(item.getCampaignId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tồn tại chiến dịch: " + item.getCampaignId()));

        LocalDateTime now = LocalDateTime.now();
        if (!campaign.isOpenAt(now)) {
            throw new ConflictException("ORD-003", "Chiến dịch chưa mở bán hoặc đã kết thúc");
        }

        ReservationStatus status = inventoryPort.tryReserve(campaignItemId, userId);
        if (status == ReservationStatus.STOCK_NOT_INITIALIZED) {
            reconcileInventoryUseCase.reconcileItem(campaignItemId);
            status = inventoryPort.tryReserve(campaignItemId, userId);
        }

        if (status == ReservationStatus.ALREADY_PURCHASED) {
            throw new ConflictException("ORD-002", "Bạn đã đặt mua sản phẩm này trong chiến dịch");
        }
        if (status != ReservationStatus.OK) {
            throw new ConflictException("ORD-001", "Sản phẩm đã hết hàng flash sale");
        }

        OrderCreatedEvent event = new OrderCreatedEvent(UUID.randomUUID(), userId, campaignItemId, now);
        try {
            orderEventPublisher.publishOrderCreated(event);
        } catch (RuntimeException ex) {
            log.error("Failed to publish OrderCreatedEvent for userId={}, itemId={}, compensating Redis reservation",
                    userId, campaignItemId, ex);
            inventoryPort.releaseReservation(campaignItemId, userId);
            throw ex;
        }

        return new Result(event.eventId(), userId, campaignItemId, OrderStatus.PENDING, now);
    }
}
