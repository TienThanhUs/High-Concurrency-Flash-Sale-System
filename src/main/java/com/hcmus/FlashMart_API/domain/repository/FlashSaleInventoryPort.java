package com.hcmus.FlashMart_API.domain.repository;

import java.util.Set;
import java.util.UUID;

public interface FlashSaleInventoryPort {

    enum ReservationStatus {
        OK,
        OUT_OF_STOCK,
        ALREADY_PURCHASED,
        STOCK_NOT_INITIALIZED
    }

    void warmUpItem(UUID campaignItemId, int availableQuantity, Set<Long> purchasedUserIds);

    ReservationStatus tryReserve(UUID campaignItemId, Long userId);

    void releaseReservation(UUID campaignItemId, Long userId);

    Long getStock(UUID campaignItemId);
}
