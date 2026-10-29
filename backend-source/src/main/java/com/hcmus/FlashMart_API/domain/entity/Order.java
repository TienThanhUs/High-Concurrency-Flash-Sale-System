package com.hcmus.FlashMart_API.domain.entity;

import com.hcmus.FlashMart_API.domain.exception.ConflictException;

import java.time.LocalDateTime;
import java.util.UUID;

public class Order {
    private final Long id;
    private final Long userId;
    private final UUID campaignItemId;
    private OrderStatus status;
    private final LocalDateTime createdAt;

    private Order(Long id, Long userId, UUID campaignItemId, OrderStatus status, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.campaignItemId = campaignItemId;
        this.status = status != null ? status : OrderStatus.PENDING;
        this.createdAt = createdAt;
    }

    public static Order createConfirmed(Long userId, UUID campaignItemId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID không được để trống");
        }
        if (campaignItemId == null) {
            throw new IllegalArgumentException("Campaign Item ID không được để trống");
        }
        return new Order(null, userId, campaignItemId, OrderStatus.CONFIRMED, LocalDateTime.now());
    }

    public static Order restore(Long id, Long userId, UUID campaignItemId, OrderStatus status, LocalDateTime createdAt) {
        return new Order(id, userId, campaignItemId, status, createdAt);
    }

    public void cancel() {
        if (this.status == OrderStatus.CANCELLED) {
            throw new ConflictException("ORD-004", "Đơn hàng đã ở trạng thái CANCELLED");
        }
        this.status = OrderStatus.CANCELLED;
    }

    public void confirm() {
        this.status = OrderStatus.CONFIRMED;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public UUID getCampaignItemId() { return campaignItemId; }
    public OrderStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
