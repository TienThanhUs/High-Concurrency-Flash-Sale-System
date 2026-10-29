package com.hcmus.FlashMart_API.infrastructure.dto;

import com.hcmus.FlashMart_API.domain.entity.CampaignStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateCampaignStatusRequest(
        @NotNull CampaignStatus status
) {
}
