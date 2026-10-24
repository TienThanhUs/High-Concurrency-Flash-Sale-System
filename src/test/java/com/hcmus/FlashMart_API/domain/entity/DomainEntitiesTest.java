package com.hcmus.FlashMart_API.domain.entity;

import com.hcmus.FlashMart_API.domain.exception.ConflictException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class DomainEntitiesTest {

    @Test
    @DisplayName("Product.create validates name, price, and stock")
    void productValidation() {
        Product p = Product.create("iPhone 16", "Flagship", BigDecimal.valueOf(25000000), 0);
        assertEquals("iPhone 16", p.getName());
        assertEquals(0, p.getGeneralStock());

        assertThrows(IllegalArgumentException.class,
                () -> Product.create("", "desc", BigDecimal.TEN, 1));
        assertThrows(IllegalArgumentException.class,
                () -> Product.create("Valid", "desc", BigDecimal.ZERO, 1));
        assertThrows(IllegalArgumentException.class,
                () -> Product.create("Valid", "desc", BigDecimal.TEN, -1));
    }

    @Test
    @DisplayName("Campaign transitions UPCOMING -> ACTIVE -> ENDED and rejects reverse transitions")
    void campaignTransitionsAndTimeWindow() {
        LocalDateTime start = LocalDateTime.now().minusMinutes(5);
        LocalDateTime end = LocalDateTime.now().plusMinutes(30);
        Campaign c = Campaign.create("11.11 Sale", start, end);

        assertEquals(CampaignStatus.UPCOMING, c.getStatus());
        assertFalse(c.isOpenAt(LocalDateTime.now()));

        c.transitionTo(CampaignStatus.ACTIVE);
        assertEquals(CampaignStatus.ACTIVE, c.getStatus());
        assertTrue(c.isOpenAt(LocalDateTime.now()));

        assertThrows(ConflictException.class, () -> c.transitionTo(CampaignStatus.UPCOMING));

        c.transitionTo(CampaignStatus.ENDED);
        assertEquals(CampaignStatus.ENDED, c.getStatus());
        assertFalse(c.isOpenAt(LocalDateTime.now()));
        assertThrows(ConflictException.class, () -> c.transitionTo(CampaignStatus.ACTIVE));
    }

    @Test
    @DisplayName("CampaignItem.create sets availableQuantity = totalQuantity")
    void campaignItemCreation() {
        UUID campId = UUID.randomUUID();
        UUID prodId = UUID.randomUUID();
        CampaignItem item = CampaignItem.create(campId, prodId, BigDecimal.valueOf(99000), 100);
        assertEquals(100, item.getTotalQuantity());
        assertEquals(100, item.getAvailableQuantity());
    }

    @Test
    @DisplayName("Order.cancel transitions to CANCELLED and prevents double cancel")
    void orderCancel() {
        Order order = Order.createConfirmed(10L, UUID.randomUUID());
        assertEquals(OrderStatus.CONFIRMED, order.getStatus());
        order.cancel();
        assertEquals(OrderStatus.CANCELLED, order.getStatus());
        assertThrows(ConflictException.class, order::cancel);
    }
}
