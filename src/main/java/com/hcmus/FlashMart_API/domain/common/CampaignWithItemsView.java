package com.hcmus.FlashMart_API.domain.common;

import com.hcmus.FlashMart_API.domain.entity.Campaign;
import com.hcmus.FlashMart_API.domain.entity.CampaignItem;

import java.util.List;

public record CampaignWithItemsView(Campaign campaign, List<CampaignItem> items) {
}
