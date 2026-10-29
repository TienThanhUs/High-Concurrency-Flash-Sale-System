package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.common.CampaignWithItemsView;
import com.hcmus.FlashMart_API.domain.entity.CampaignStatus;

import java.util.UUID;

public interface UpdateCampaignStatusUseCase {
    CampaignWithItemsView execute(UUID campaignId, CampaignStatus newStatus);
}
