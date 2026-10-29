package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.entity.CampaignItem;

import java.math.BigDecimal;
import java.util.UUID;

public interface AddCampaignItemUseCase {
    record Command(UUID campaignId, UUID productId, BigDecimal flashSalePrice, Integer totalQuantity) {}

    CampaignItem execute(Command command);
}
