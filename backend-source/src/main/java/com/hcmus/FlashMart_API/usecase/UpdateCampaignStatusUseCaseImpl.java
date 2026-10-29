package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.common.CampaignWithItemsView;
import com.hcmus.FlashMart_API.domain.entity.Campaign;
import com.hcmus.FlashMart_API.domain.entity.CampaignItem;
import com.hcmus.FlashMart_API.domain.entity.CampaignStatus;
import com.hcmus.FlashMart_API.domain.exception.ResourceNotFoundException;
import com.hcmus.FlashMart_API.domain.repository.CampaignItemRepository;
import com.hcmus.FlashMart_API.domain.repository.CampaignRepository;
import com.hcmus.FlashMart_API.domain.repository.FlashSaleInventoryPort;
import com.hcmus.FlashMart_API.domain.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UpdateCampaignStatusUseCaseImpl implements UpdateCampaignStatusUseCase {
    private final CampaignRepository campaignRepository;
    private final CampaignItemRepository campaignItemRepository;
    private final OrderRepository orderRepository;
    private final FlashSaleInventoryPort inventoryPort;

    @Override
    @Transactional
    public CampaignWithItemsView execute(UUID campaignId, CampaignStatus newStatus) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tồn tại chiến dịch: " + campaignId));
        campaign.transitionTo(newStatus);
        Campaign saved = campaignRepository.save(campaign);
        List<CampaignItem> items = campaignItemRepository.findByCampaignId(campaignId);

        if (saved.getStatus() == CampaignStatus.ACTIVE) {
            for (CampaignItem item : items) {
                Set<Long> buyers = orderRepository.findActiveBuyerIdsByCampaignItemId(item.getId());
                inventoryPort.warmUpItem(item.getId(), item.getAvailableQuantity(), buyers);
            }
        }
        return new CampaignWithItemsView(saved, items);
    }
}
