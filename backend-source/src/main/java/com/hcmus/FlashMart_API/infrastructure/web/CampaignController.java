package com.hcmus.FlashMart_API.infrastructure.web;

import com.hcmus.FlashMart_API.domain.common.CampaignWithItemsView;
import com.hcmus.FlashMart_API.domain.entity.Campaign;
import com.hcmus.FlashMart_API.domain.entity.CampaignItem;
import com.hcmus.FlashMart_API.infrastructure.dto.*;
import com.hcmus.FlashMart_API.usecase.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/campaigns")
public class CampaignController {

    private final CreateCampaignUseCase createCampaignUseCase;
    private final AddCampaignItemUseCase addCampaignItemUseCase;
    private final UpdateCampaignStatusUseCase updateCampaignStatusUseCase;
    private final GetActiveCampaignsUseCase getActiveCampaignsUseCase;
    private final ReconcileInventoryUseCase reconcileInventoryUseCase;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CampaignResponse> createCampaign(@Valid @RequestBody CreateCampaignRequest request) {
        Campaign saved = createCampaignUseCase.execute(new CreateCampaignUseCase.Command(
                request.name(), request.startTime(), request.endTime()));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CampaignResponse.from(saved, List.of()));
    }

    @PostMapping("/{campaignId}/items")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CampaignItemResponse> addCampaignItem(
            @PathVariable UUID campaignId,
            @Valid @RequestBody AddCampaignItemRequest request) {
        CampaignItem saved = addCampaignItemUseCase.execute(new AddCampaignItemUseCase.Command(
                campaignId, request.productId(), request.flashSalePrice(), request.totalQuantity()));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CampaignItemResponse.from(saved));
    }

    @PatchMapping("/{campaignId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CampaignResponse> updateCampaignStatus(
            @PathVariable UUID campaignId,
            @Valid @RequestBody UpdateCampaignStatusRequest request) {
        CampaignWithItemsView view = updateCampaignStatusUseCase.execute(campaignId, request.status());
        return ResponseEntity.ok(CampaignResponse.from(view));
    }

    @GetMapping("/active")
    public ResponseEntity<List<CampaignResponse>> getActiveCampaigns() {
        List<CampaignResponse> responses = getActiveCampaignsUseCase.execute().stream()
                .map(CampaignResponse::from)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/reconcile")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> reconcileInventory() {
        int count = reconcileInventoryUseCase.reconcileAllActiveCampaigns();
        return ResponseEntity.ok(Map.of("reconciledItems", count));
    }
}
