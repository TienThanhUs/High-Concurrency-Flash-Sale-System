package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.entity.Campaign;

import java.time.LocalDateTime;

public interface CreateCampaignUseCase {
    record Command(String name, LocalDateTime startTime, LocalDateTime endTime) {}

    Campaign execute(Command command);
}
