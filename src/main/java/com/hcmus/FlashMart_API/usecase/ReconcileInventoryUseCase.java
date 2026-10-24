package com.hcmus.FlashMart_API.usecase;

import java.util.UUID;

public interface ReconcileInventoryUseCase {
    /** Reconciles all items of all ACTIVE campaigns from PostgreSQL to Redis. */
    int reconcileAllActiveCampaigns();

    /** Reconciles a single campaign item from PostgreSQL to Redis. */
    void reconcileItem(UUID campaignItemId);
}
