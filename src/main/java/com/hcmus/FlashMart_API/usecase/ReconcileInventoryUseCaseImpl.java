package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.entity.Campaign;
import com.hcmus.FlashMart_API.domain.entity.CampaignItem;
import com.hcmus.FlashMart_API.domain.entity.CampaignStatus;
import com.hcmus.FlashMart_API.domain.exception.ResourceNotFoundException;
import com.hcmus.FlashMart_API.domain.repository.CampaignItemRepository;
import com.hcmus.FlashMart_API.domain.repository.CampaignRepository;
import com.hcmus.FlashMart_API.domain.repository.FlashSaleInventoryPort;
import com.hcmus.FlashMart_API.domain.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReconcileInventoryUseCaseImpl implements ReconcileInventoryUseCase {
    private final CampaignRepository campaignRepository;
    private final CampaignItemRepository campaignItemRepository;
    private final OrderRepository orderRepository;
    private final FlashSaleInventoryPort inventoryPort;

    @Override
    @Transactional(readOnly = true)
    public int reconcileAllActiveCampaigns() {
        List<Campaign> activeCampaigns = campaignRepository.findByStatus(CampaignStatus.ACTIVE);
        int count = 0;
        for (Campaign campaign : activeCampaigns) {
            List<CampaignItem> items = campaignItemRepository.findByCampaignId(campaign.getId());
            for (CampaignItem item : items) {
                Set<Long> buyers = orderRepository.findActiveBuyerIdsByCampaignItemId(item.getId());
                inventoryPort.warmUpItem(item.getId(), item.getAvailableQuantity(), buyers);
                count++;
            }
        }
        log.info("Reconciled {} active campaign items from PostgreSQL to Redis", count);
        return count;
    }

    @Override
    @Transactional(readOnly = true)
    public void reconcileItem(UUID campaignItemId) {
        CampaignItem item = campaignItemRepository.findById(campaignItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tồn tại campaign item: " + campaignItemId));
        Set<Long> buyers = orderRepository.findActiveBuyerIdsByCampaignItemId(item.getId());
        inventoryPort.warmUpItem(item.getId(), item.getAvailableQuantity(), buyers);
    }
}
