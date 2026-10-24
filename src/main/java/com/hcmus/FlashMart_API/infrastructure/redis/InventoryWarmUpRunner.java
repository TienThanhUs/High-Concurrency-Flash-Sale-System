package com.hcmus.FlashMart_API.infrastructure.redis;

import com.hcmus.FlashMart_API.usecase.ReconcileInventoryUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Re-synchronizes active campaign stock and buyer sets from PostgreSQL into Redis on startup.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryWarmUpRunner implements ApplicationRunner {
    private final ReconcileInventoryUseCase reconcileInventoryUseCase;

    @Override
    public void run(ApplicationArguments args) {
        try {
            reconcileInventoryUseCase.reconcileAllActiveCampaigns();
        } catch (Exception e) {
            log.warn("Initial Redis inventory warm-up skipped/failed: {}", e.getMessage());
        }
    }
}
