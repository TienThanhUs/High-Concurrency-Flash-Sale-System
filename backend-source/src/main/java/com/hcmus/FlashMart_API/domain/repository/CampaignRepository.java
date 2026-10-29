package com.hcmus.FlashMart_API.domain.repository;

import com.hcmus.FlashMart_API.domain.entity.Campaign;
import com.hcmus.FlashMart_API.domain.entity.CampaignStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CampaignRepository {
    Campaign save(Campaign campaign);
    Optional<Campaign> findById(UUID id);
    List<Campaign> findByStatus(CampaignStatus status);
}
