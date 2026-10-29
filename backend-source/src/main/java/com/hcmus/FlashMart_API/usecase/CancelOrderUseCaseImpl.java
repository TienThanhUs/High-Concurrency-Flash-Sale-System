package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.entity.Order;
import com.hcmus.FlashMart_API.domain.entity.Role;
import com.hcmus.FlashMart_API.domain.exception.ForbiddenException;
import com.hcmus.FlashMart_API.domain.exception.ResourceNotFoundException;
import com.hcmus.FlashMart_API.domain.repository.CampaignItemRepository;
import com.hcmus.FlashMart_API.domain.repository.FlashSaleInventoryPort;
import com.hcmus.FlashMart_API.domain.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CancelOrderUseCaseImpl implements CancelOrderUseCase {
    private final OrderRepository orderRepository;
    private final CampaignItemRepository campaignItemRepository;
    private final FlashSaleInventoryPort inventoryPort;

    @Override
    @Transactional
    public Order execute(Long orderId, Long requesterId, Role requesterRole) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tồn tại đơn hàng: " + orderId));
        if (requesterRole != Role.ADMIN && !order.getUserId().equals(requesterId)) {
            throw new ForbiddenException("Bạn không có quyền huỷ đơn hàng này");
        }
        order.cancel();
        Order saved = orderRepository.save(order);
        campaignItemRepository.incrementAvailableQuantity(order.getCampaignItemId());
        inventoryPort.releaseReservation(order.getCampaignItemId(), order.getUserId());
        return saved;
    }
}
