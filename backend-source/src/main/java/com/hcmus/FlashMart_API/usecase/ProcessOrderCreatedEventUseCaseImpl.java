package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.entity.Order;
import com.hcmus.FlashMart_API.domain.entity.OrderStatus;
import com.hcmus.FlashMart_API.domain.event.OrderCreatedEvent;
import com.hcmus.FlashMart_API.domain.repository.CampaignItemRepository;
import com.hcmus.FlashMart_API.domain.repository.FlashSaleInventoryPort;
import com.hcmus.FlashMart_API.domain.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProcessOrderCreatedEventUseCaseImpl implements ProcessOrderCreatedEventUseCase {

    private final OrderRepository orderRepository;
    private final CampaignItemRepository campaignItemRepository;
    private final FlashSaleInventoryPort inventoryPort;

    @Override
    @Transactional
    public void execute(OrderCreatedEvent event) {
        Long userId = event.userId();
        UUID itemId = event.campaignItemId();

        Optional<Order> existingOpt = orderRepository.findByUserIdAndCampaignItemId(userId, itemId);
        if (existingOpt.isPresent()) {
            Order existing = existingOpt.get();
            if (existing.getStatus() != OrderStatus.CANCELLED) {
                log.info("Idempotent skip: order already exists for userId={}, campaignItemId={}", userId, itemId);
                return;
            }
            int updated = campaignItemRepository.decrementAvailableQuantity(itemId);
            if (updated == 0) {
                log.warn("No DB stock left on re-order for userId={}, campaignItemId={}; releasing Redis", userId, itemId);
                inventoryPort.releaseReservation(itemId, userId);
                return;
            }
            existing.confirm();
            orderRepository.save(existing);
            return;
        }

        int updated = campaignItemRepository.decrementAvailableQuantity(itemId);
        if (updated == 0) {
            log.warn("No DB stock left for userId={}, campaignItemId={}; releasing Redis reservation", userId, itemId);
            inventoryPort.releaseReservation(itemId, userId);
            return;
        }

        try {
            orderRepository.save(Order.createConfirmed(userId, itemId));
        } catch (DataIntegrityViolationException dup) {
            log.info("Idempotent duplicate caught on UNIQUE(user_id, campaign_item_id) for userId={}, itemId={}",
                    userId, itemId);
            campaignItemRepository.incrementAvailableQuantity(itemId);
        }
    }
}
