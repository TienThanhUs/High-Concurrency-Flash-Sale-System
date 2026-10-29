package com.hcmus.FlashMart_API.infrastructure.dto;

import com.hcmus.FlashMart_API.domain.common.CampaignWithItemsView;
import com.hcmus.FlashMart_API.domain.entity.Campaign;
import com.hcmus.FlashMart_API.domain.entity.CampaignStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record CampaignResponse(
        UUID id,
        String name,
        LocalDateTime startTime,
        LocalDateTime endTime,
        CampaignStatus status,
        LocalDateTime createdAt,
        List<CampaignItemResponse> items
) {
    public static CampaignResponse from(Campaign c, List<CampaignItemResponse> items) {
        return new CampaignResponse(
                c.getId(),
                c.getName(),
                c.getStartTime(),
                c.getEndTime(),
                c.getStatus(),
                c.getCreatedAt(),
                items
        );
    }

    public static CampaignResponse from(CampaignWithItemsView view) {
        List<CampaignItemResponse> itemResponses = view.items().stream()
                .map(CampaignItemResponse::from)
                .toList();
        return from(view.campaign(), itemResponses);
    }
}
