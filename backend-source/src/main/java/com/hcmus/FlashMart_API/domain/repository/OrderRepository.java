package com.hcmus.FlashMart_API.domain.repository;

import com.hcmus.FlashMart_API.domain.entity.Order;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface OrderRepository {
    Order save(Order order);
    Optional<Order> findById(Long id);
    Optional<Order> findByUserIdAndCampaignItemId(Long userId, UUID campaignItemId);
    List<Order> findByUserId(Long userId);
    Set<Long> findActiveBuyerIdsByCampaignItemId(UUID campaignItemId);
}
