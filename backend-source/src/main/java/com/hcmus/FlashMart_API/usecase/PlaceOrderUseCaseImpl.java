package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.entity.Campaign;
import com.hcmus.FlashMart_API.domain.entity.CampaignItem;
import com.hcmus.FlashMart_API.domain.entity.OrderStatus;
import com.hcmus.FlashMart_API.domain.event.OrderCreatedEvent;
import com.hcmus.FlashMart_API.domain.event.OrderEventPublisher;
import com.hcmus.FlashMart_API.domain.exception.ConflictException;
import com.hcmus.FlashMart_API.domain.exception.ResourceNotFoundException;
import com.hcmus.FlashMart_API.domain.repository.CampaignItemRepository;
import com.hcmus.FlashMart_API.domain.repository.CampaignRepository;
import com.hcmus.FlashMart_API.domain.repository.FlashSaleInventoryPort;
import com.hcmus.FlashMart_API.domain.repository.FlashSaleInventoryPort.ReservationStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

import static com.hcmus.FlashMart_API.domain.repository.FlashSaleInventoryPort.ReservationStatus.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlaceOrderUseCaseImpl implements PlaceOrderUseCase {
    private final CampaignItemRepository campaignItemRepository;
    private final CampaignRepository campaignRepository;
    private final FlashSaleInventoryPort flashSaleInventoryPort;
    private final ReconcileInventoryUseCase reconcileInventoryUseCase;
    private final OrderEventPublisher orderEventPublisher;
    @Override
    public Result execute(Long userId, UUID campaignItemId) {
        // kiem tra item ton tai khong
        CampaignItem item = campaignItemRepository.findById(campaignItemId)
                .orElseThrow(()->new ResourceNotFoundException("Không tồn tại sản phẩm sale:" + campaignItemId));
        // kiem tra chien dich co ton tai khong
        Campaign campaign = campaignRepository.findById(item.getCampaignId())
                .orElseThrow(()-> new ResourceNotFoundException("Không tồn tại chiến dịch:" + item.getCampaignId()));
        LocalDateTime now = LocalDateTime.now();
        // kiem tra chien dich da mo chua
        if(!campaign.isOpenAt(now))
        {
            throw new ConflictException("ORD-003","Chiến dịch chưa mở");
        }
        // goi redis chay lua script de check status
        ReservationStatus status = flashSaleInventoryPort.tryReserve(campaignItemId,userId);
        // xu ly voi truong hop chua co san pham tren redis
        if(status == STOCK_NOT_INITIALIZED)
        {
            reconcileInventoryUseCase.reconcileItem(campaignItemId);
            status = flashSaleInventoryPort.tryReserve(campaignItemId,userId);
        }
        // xu ly voi truong hop nguoi dung da mua
        if(status == ALREADY_PURCHASED)
        {
            throw new ConflictException("ORD-002", "Đã mua sản phẩm");
        }
        // xu ly voi truong hop da het hang
        if(status != OK)
        {
            throw new ConflictException("ORD-001", "Sản phẩm đã hết !!!");
        }

        OrderCreatedEvent event = new OrderCreatedEvent(UUID.randomUUID(),userId,campaignItemId,now);
        // neu khong co loi thi day su kien sang cho kafka
        try {
            orderEventPublisher.publishOrderCreated(event);
        }
        catch(RuntimeException ex)
        {
            log.error("Không thể tạo order với userId = {}, itemId = {}", userId, campaignItemId);
            flashSaleInventoryPort.releaseReservation(campaignItemId,userId);
            throw ex;
        }
        // tra ket qua ve cho nguoi dung
        return new Result(event.eventId(),userId,campaignItemId,OrderStatus.PENDING,now);
    }
}
