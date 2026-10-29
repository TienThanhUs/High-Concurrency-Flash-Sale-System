package com.hcmus.FlashMart_API.infrastructure.persistence;

import com.hcmus.FlashMart_API.domain.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface OrderJpaRepository extends JpaRepository<OrderJpaEntity, Long> {
    Optional<OrderJpaEntity> findByUserIdAndCampaignItemId(Long userId, UUID campaignItemId);

    List<OrderJpaEntity> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("""
            SELECT o.userId
              FROM OrderJpaEntity o
             WHERE o.campaignItemId = :campaignItemId
               AND o.status <> :excludedStatus
            """)
    Set<Long> findUserIdsByCampaignItemIdAndStatusNot(
            @Param("campaignItemId") UUID campaignItemId,
            @Param("excludedStatus") OrderStatus excludedStatus);
}
