package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.entity.Campaign;
import com.hcmus.FlashMart_API.domain.entity.CampaignItem;
import com.hcmus.FlashMart_API.domain.entity.CampaignStatus;
import com.hcmus.FlashMart_API.domain.exception.ConflictException;
import com.hcmus.FlashMart_API.domain.exception.ResourceNotFoundException;
import com.hcmus.FlashMart_API.domain.repository.CampaignItemRepository;
import com.hcmus.FlashMart_API.domain.repository.CampaignRepository;
import com.hcmus.FlashMart_API.domain.repository.FlashSaleInventoryPort;
import com.hcmus.FlashMart_API.domain.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AddCampaignItemUseCaseImpl implements AddCampaignItemUseCase {
    private final CampaignRepository campaignRepository;
    private final ProductRepository productRepository;
    private final CampaignItemRepository campaignItemRepository;
    private final FlashSaleInventoryPort inventoryPort;

    @Override
    @Transactional
    public CampaignItem execute(Command c) {
        Campaign campaign = campaignRepository.findById(c.campaignId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tồn tại chiến dịch: " + c.campaignId()));
        if (campaign.getStatus() == CampaignStatus.ENDED) {
            throw new ConflictException("CAMP-002", "Không thể thêm sản phẩm vào chiến dịch đã kết thúc");
        }
        if (!productRepository.existsById(c.productId())) {
            throw new ResourceNotFoundException("Không tồn tại sản phẩm: " + c.productId());
        }
        if (campaignItemRepository.existsByCampaignIdAndProductId(c.campaignId(), c.productId())) {
            throw new ConflictException("CAMP-003", "Sản phẩm đã tồn tại trong chiến dịch này");
        }
        CampaignItem saved = campaignItemRepository.save(
                CampaignItem.create(c.campaignId(), c.productId(), c.flashSalePrice(), c.totalQuantity()));
        if (campaign.getStatus() == CampaignStatus.ACTIVE) {
            inventoryPort.warmUpItem(saved.getId(), saved.getAvailableQuantity(), Set.of());
        }
        return saved;
    }
}
