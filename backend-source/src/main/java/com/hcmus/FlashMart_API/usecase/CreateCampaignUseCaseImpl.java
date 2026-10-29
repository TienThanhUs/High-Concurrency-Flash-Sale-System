package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.entity.Campaign;
import com.hcmus.FlashMart_API.domain.repository.CampaignRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CreateCampaignUseCaseImpl implements CreateCampaignUseCase {
    private final CampaignRepository campaignRepository;

    @Override
    @Transactional
    public Campaign execute(Command command) {
        Campaign campaign = Campaign.create(command.name(), command.startTime(), command.endTime());
        return campaignRepository.save(campaign);
    }
}
