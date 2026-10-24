package com.hcmus.FlashMart_API.infrastructure.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record CreateCampaignRequest(
        @NotBlank @Size(max = 100) String name,
        @NotNull LocalDateTime startTime,
        @NotNull LocalDateTime endTime
) {
}
