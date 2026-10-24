package com.hcmus.FlashMart_API.infrastructure.persistence;

import com.hcmus.FlashMart_API.domain.entity.Order;
import com.hcmus.FlashMart_API.domain.entity.OrderStatus;
import com.hcmus.FlashMart_API.domain.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class OrderRepositoryAdapter implements OrderRepository {
    private final OrderJpaRepository repository;

    @Override
    public Order save(Order order) {
        OrderJpaEntity entity = new OrderJpaEntity();
        entity.setId(order.getId());
        entity.setUserId(order.getUserId());
        entity.setCampaignItemId(order.getCampaignItemId());
        entity.setStatus(order.getStatus());
        entity.setCreatedAt(order.getCreatedAt());
        return toDomain(repository.save(entity));
    }

    @Override
    public Optional<Order> findById(Long id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<Order> findByUserIdAndCampaignItemId(Long userId, UUID campaignItemId) {
        return repository.findByUserIdAndCampaignItemId(userId, campaignItemId).map(this::toDomain);
    }

    @Override
    public List<Order> findByUserId(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public Set<Long> findActiveBuyerIdsByCampaignItemId(UUID campaignItemId) {
        return repository.findUserIdsByCampaignItemIdAndStatusNot(campaignItemId, OrderStatus.CANCELLED);
    }

    private Order toDomain(OrderJpaEntity e) {
        return Order.restore(e.getId(), e.getUserId(), e.getCampaignItemId(), e.getStatus(), e.getCreatedAt());
    }
}
