package com.hcmus.FlashMart_API.domain.entity;

import com.hcmus.FlashMart_API.domain.exception.ConflictException;

import java.time.LocalDateTime;
import java.util.UUID;

public class Campaign {
    private final UUID id;
    private String name;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private CampaignStatus status;
    private final LocalDateTime createdAt;

    private Campaign(UUID id, String name, LocalDateTime startTime, LocalDateTime endTime,
                     CampaignStatus status, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status != null ? status : CampaignStatus.UPCOMING;
        this.createdAt = createdAt;
    }

    public static Campaign create(String name, LocalDateTime startTime, LocalDateTime endTime) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Tên chiến dịch không được để trống");
        }
        if (startTime == null || endTime == null || !endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("Thời gian kết thúc phải sau thời gian bắt đầu");
        }
        return new Campaign(null, name, startTime, endTime, CampaignStatus.UPCOMING, LocalDateTime.now());
    }

    public static Campaign restore(UUID id, String name, LocalDateTime startTime, LocalDateTime endTime,
                                   CampaignStatus status, LocalDateTime createdAt) {
        return new Campaign(id, name, startTime, endTime, status, createdAt);
    }

    public void transitionTo(CampaignStatus target) {
        if (target == null) {
            throw new IllegalArgumentException("Trạng thái chiến dịch không hợp lệ");
        }
        if (this.status == target) {
            return;
        }
        boolean allowed = (this.status == CampaignStatus.UPCOMING && target == CampaignStatus.ACTIVE)
                || (this.status == CampaignStatus.ACTIVE && target == CampaignStatus.ENDED)
                || (this.status == CampaignStatus.UPCOMING && target == CampaignStatus.ENDED);
        if (!allowed) {
            throw new ConflictException("CAMP-001",
                    "Không thể chuyển trạng thái chiến dịch từ " + this.status + " sang " + target);
        }
        this.status = target;
    }

    public boolean isOpenAt(LocalDateTime now) {
        return this.status == CampaignStatus.ACTIVE
                && !now.isBefore(startTime)
                && !now.isAfter(endTime);
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public LocalDateTime getStartTime() { return startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public CampaignStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
