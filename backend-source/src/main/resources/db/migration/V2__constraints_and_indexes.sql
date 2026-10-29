-- V2__constraints_and_indexes.sql
ALTER TABLE campaign_items
    ADD CONSTRAINT chk_campaign_items_available_quantity_non_negative CHECK (available_quantity >= 0),
    ADD CONSTRAINT chk_campaign_items_total_quantity_positive CHECK (total_quantity > 0),
    ADD CONSTRAINT chk_campaign_items_flash_sale_price_positive CHECK (flash_sale_price > 0),
    ADD CONSTRAINT uq_campaign_items_campaign_product UNIQUE (campaign_id, product_id);

ALTER TABLE campaigns
    ADD CONSTRAINT chk_campaigns_time_range CHECK (end_time > start_time);

CREATE INDEX idx_campaigns_status_time ON campaigns(status, start_time, end_time);
CREATE INDEX idx_campaign_items_product_id ON campaign_items(product_id);
