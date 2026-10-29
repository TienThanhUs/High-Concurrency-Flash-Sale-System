package com.hcmus.FlashMart_API.infrastructure.persistence;

import com.hcmus.FlashMart_API.domain.entity.Campaign;
import com.hcmus.FlashMart_API.domain.entity.CampaignStatus;
import com.hcmus.FlashMart_API.domain.repository.CampaignRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class CampaignRepositoryAdapter implements CampaignRepository {
    private final CampaignJpaRepository repository;

    @Override
    public Campaign save(Campaign campaign) {
        CampaignJpaEntity entity = new CampaignJpaEntity();
        entity.setId(campaign.getId());
        entity.setName(campaign.getName());
        entity.setStartTime(campaign.getStartTime());
        entity.setEndTime(campaign.getEndTime());
        entity.setStatus(campaign.getStatus());
        entity.setCreatedAt(campaign.getCreatedAt());
        return toDomain(repository.save(entity));
    }

    @Override
    public Optional<Campaign> findById(UUID id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Campaign> findByStatus(CampaignStatus status) {
        return repository.findByStatusOrderByStartTimeAsc(status).stream()
                .map(this::toDomain)
                .toList();
    }

    private Campaign toDomain(CampaignJpaEntity e) {
        return Campaign.restore(
                e.getId(),
                e.getName(),
                e.getStartTime(),
                e.getEndTime(),
                e.getStatus(),
                e.getCreatedAt()
        );
    }
}
