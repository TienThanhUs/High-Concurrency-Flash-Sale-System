package com.hcmus.FlashMart_API.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface CampaignItemJpaRepository extends JpaRepository<CampaignItemJpaEntity, UUID> {
    List<CampaignItemJpaEntity> findByCampaignId(UUID campaignId);

    boolean existsByCampaignIdAndProductId(UUID campaignId, UUID productId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE CampaignItemJpaEntity ci
               SET ci.availableQuantity = ci.availableQuantity - 1,
                   ci.version = ci.version + 1
             WHERE ci.id = :id
               AND ci.availableQuantity > 0
            """)
    int decrementAvailableQuantity(@Param("id") UUID id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE CampaignItemJpaEntity ci
               SET ci.availableQuantity = ci.availableQuantity + 1,
                   ci.version = ci.version + 1
             WHERE ci.id = :id
               AND ci.availableQuantity < ci.totalQuantity
            """)
    int incrementAvailableQuantity(@Param("id") UUID id);
}
