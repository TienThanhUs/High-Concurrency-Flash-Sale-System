package com.hcmus.FlashMart_API.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "campaign_items")
public class CampaignItemJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "campaign_id", nullable = false)
    private UUID campaignId;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "flash_sale_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal flashSalePrice;

    @Column(name = "total_quantity", nullable = false)
    private Integer totalQuantity;

    @Column(name = "available_quantity", nullable = false)
    private Integer availableQuantity;

    @Version
    @Column(name = "version")
    private Integer version;
}
