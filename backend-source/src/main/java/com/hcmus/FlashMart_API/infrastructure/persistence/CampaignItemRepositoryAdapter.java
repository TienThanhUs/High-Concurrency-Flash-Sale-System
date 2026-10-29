package com.hcmus.FlashMart_API.infrastructure.persistence;

import com.hcmus.FlashMart_API.domain.entity.CampaignItem;
import com.hcmus.FlashMart_API.domain.repository.CampaignItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class CampaignItemRepositoryAdapter implements CampaignItemRepository {
    private final CampaignItemJpaRepository repository;

    @Override
    public CampaignItem save(CampaignItem item) {
        CampaignItemJpaEntity entity = new CampaignItemJpaEntity();
        entity.setId(item.getId());
        entity.setCampaignId(item.getCampaignId());
        entity.setProductId(item.getProductId());
        entity.setFlashSalePrice(item.getFlashSalePrice());
        entity.setTotalQuantity(item.getTotalQuantity());
        entity.setAvailableQuantity(item.getAvailableQuantity());
        entity.setVersion(item.getVersion());
        return toDomain(repository.save(entity));
    }

    @Override
    public Optional<CampaignItem> findById(UUID id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public List<CampaignItem> findByCampaignId(UUID campaignId) {
        return repository.findByCampaignId(campaignId).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public boolean existsByCampaignIdAndProductId(UUID campaignId, UUID productId) {
        return repository.existsByCampaignIdAndProductId(campaignId, productId);
    }

    @Override
    public int decrementAvailableQuantity(UUID id) {
        return repository.decrementAvailableQuantity(id);
    }

    @Override
    public int incrementAvailableQuantity(UUID id) {
        return repository.incrementAvailableQuantity(id);
    }

    private CampaignItem toDomain(CampaignItemJpaEntity e) {
        return CampaignItem.restore(
                e.getId(),
                e.getCampaignId(),
                e.getProductId(),
                e.getFlashSalePrice(),
                e.getTotalQuantity(),
                e.getAvailableQuantity(),
                e.getVersion()
        );
    }
}
