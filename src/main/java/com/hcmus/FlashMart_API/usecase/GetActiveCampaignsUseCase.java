package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.common.CampaignWithItemsView;

import java.util.List;

public interface GetActiveCampaignsUseCase {
    List<CampaignWithItemsView> execute();
}
