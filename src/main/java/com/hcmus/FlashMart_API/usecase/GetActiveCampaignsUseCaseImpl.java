package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.common.CampaignWithItemsView;
import com.hcmus.FlashMart_API.domain.entity.Campaign;
import com.hcmus.FlashMart_API.domain.entity.CampaignItem;
import com.hcmus.FlashMart_API.domain.entity.CampaignStatus;
import com.hcmus.FlashMart_API.domain.repository.CampaignItemRepository;
import com.hcmus.FlashMart_API.domain.repository.CampaignRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GetActiveCampaignsUseCaseImpl implements GetActiveCampaignsUseCase {
    private final CampaignRepository campaignRepository;
    private final CampaignItemRepository campaignItemRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CampaignWithItemsView> execute() {
        List<Campaign> activeCampaigns = campaignRepository.findByStatus(CampaignStatus.ACTIVE);
        return activeCampaigns.stream()
                .map(c -> {
                    List<CampaignItem> items = campaignItemRepository.findByCampaignId(c.getId());
                    return new CampaignWithItemsView(c, items);
                })
                .toList();
    }
}
