package com.hcmus.FlashMart_API.domain.repository;

import com.hcmus.FlashMart_API.domain.entity.CampaignItem;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CampaignItemRepository {
    CampaignItem save(CampaignItem item);
    Optional<CampaignItem> findById(UUID id);
    List<CampaignItem> findByCampaignId(UUID campaignId);
    boolean existsByCampaignIdAndProductId(UUID campaignId, UUID productId);
    int decrementAvailableQuantity(UUID id);
    int incrementAvailableQuantity(UUID id);
}
