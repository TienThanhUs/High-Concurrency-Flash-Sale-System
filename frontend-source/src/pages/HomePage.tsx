import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  PixelButton,
  PixelCard,
  PixelBadge,
  PixelProgressBar,
  CountdownTimer,
  ProductImage,
  PixelLoading,
  PixelEmpty,
  PixelError,
} from '../components/ui';
import { PixelIconZap, PixelIconFlame } from '../components/icons/PixelIcon';
import { HuntSaleModal } from '../components/campaign/HuntSaleModal';
import { campaignService, productService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { parseApiError } from '../utils/errorHandler';
import { Campaign, CampaignItem } from '../types/campaign';
import { Product } from '../types/product';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [enrichedItems, setEnrichedItems] = useState<Record<string, Product | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected item for modal
  const [selectedItem, setSelectedItem] = useState<CampaignItem | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchActiveCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await campaignService.getActiveCampaigns();
      setCampaigns(data);

      // Fetch products for all campaign items to enrich details
      const productMap: Record<string, Product | null> = {};
      const allItemProductIds = Array.from(
        new Set(data.flatMap((c) => c.items.map((i) => i.productId)))
      );

      await Promise.all(
        allItemProductIds.map(async (pid) => {
          try {
            const p = await productService.getProductById(pid);
            productMap[pid] = p;
          } catch {
            productMap[pid] = null;
          }
        })
      );

      setEnrichedItems(productMap);
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveCampaigns();
  }, [fetchActiveCampaigns]);

  const handleOpenHuntModal = (item: CampaignItem, product: Product | null) => {
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để tham gia săn sale!', 'warning');
      navigate('/login', { state: { from: location } });
      return;
    }

    setSelectedItem(item);
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  if (loading) {
    return <PixelLoading message="Đang tải các chiến dịch Flash Sale..." className="py-20" />;
  }

  if (error) {
    return (
      <div className="py-12">
        <PixelError message={error} onRetry={fetchActiveCampaigns} />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="py-12">
        <PixelEmpty
          title="HIỆN CHƯA CÓ CHIẾN DỊCH FLASH SALE"
          message="Hệ thống đang chuẩn bị các chiến dịch giờ vàng tiếp theo. Bạn có thể xem toàn bộ danh mục sản phẩm trước!"
          actionText="Xem danh mục sản phẩm"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <section className="pixel-box p-6 bg-bg-panel border-4 border-outline flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-pixel-yellow text-[#261a00] [text-shadow:1px_1px_0_rgba(255,255,255,0.45)] px-3 py-1 border-2 border-outline font-pixel text-[16px] font-bold">
            <PixelIconFlame size={16} /> Giờ vàng giá sốc 8-bit
          </div>
          <h1 className="font-pixel text-[24px] md:text-[32px] text-pixel-yellow font-bold">
            Săn sale chớp nhoáng, giảm tới 70%
          </h1>
          <p className="font-body text-[16px] text-text-muted max-w-xl">
            Tồn kho giới hạn được bảo vệ bởi Redis Lua script và xác nhận đơn hàng qua Kafka tốc độ
            cao.
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-center gap-2">
          <PixelBadge variant="green">Đang hoạt động</PixelBadge>
          <span className="font-pixel text-[16px] text-text-muted">
            {campaigns.length} chiến dịch mở
          </span>
        </div>
      </section>

      {/* Campaigns Listing */}
      <section className="space-y-10">
        {campaigns.map((camp) => (
          <article
            key={camp.id}
            className="space-y-4 bg-bg-panel/40 p-4 md:p-6 border-3 border-outline shadow-[inset_2px_2px_0_0_rgba(255,255,255,0.05),3px_3px_0_0_var(--outline)]"
          >
            {/* Campaign Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-3 border-outline">
              <div className="flex items-center gap-2.5">
                <span className="p-1 bg-pixel-yellow text-text-on-accent border-2 border-outline">
                  <PixelIconZap size={18} />
                </span>
                <div>
                  <h2 className="font-pixel text-[24px] text-text-main font-bold">
                    {camp.name}
                  </h2>
                  <span className="font-body text-[16px] text-text-muted">
                    {camp.items.length} sản phẩm flash sale
                  </span>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center gap-2">
                <CountdownTimer
                  endTime={camp.endTime}
                  onExpire={() => fetchActiveCampaigns()}
                  label="Kết thúc trong"
                />
              </div>
            </div>

            {/* Campaign Items Grid */}
            {camp.items.length === 0 ? (
              <p className="font-body text-[16px] text-text-muted py-4">
                Chưa có sản phẩm nào được gán vào chiến dịch này.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {camp.items.map((item) => {
                  const product = enrichedItems[item.productId];
                  const productName = product?.name || 'Sản phẩm Flash Sale';
                  const originalPrice = product?.originalPrice || item.flashSalePrice * 1.4;
                  const salePrice = item.flashSalePrice;
                  const isSoldOut = item.availableQuantity <= 0;
                  const discountPercent = Math.max(
                    1,
                    Math.round(((originalPrice - salePrice) / originalPrice) * 100)
                  );
                  const soldCount = item.totalQuantity - item.availableQuantity;

                  return (
                    <PixelCard
                      key={item.id}
                      className="flex flex-col justify-between hover:-translate-y-1 transition-transform"
                    >
                      <div>
                        {/* Avatar & Badges */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <ProductImage
                            productId={product?.id || item.productId}
                            name={productName}
                            size={64}
                          />
                          <div className="flex flex-col items-end gap-1.5">
                            <PixelBadge variant={isSoldOut ? 'red' : 'yellow'}>
                              {isSoldOut ? 'Hết hàng' : `-${discountPercent}%`}
                            </PixelBadge>
                            <span className="font-pixel text-[16px] text-text-muted">
                              ID: {item.productId.slice(0, 8)}
                            </span>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h3 className="font-pixel text-[16px] text-text-main font-bold mb-1 line-clamp-2 min-h-[44px]">
                          {productName}
                        </h3>
                        <p className="font-body text-[16px] text-text-muted line-clamp-2 min-h-[48px] mb-4">
                          {product?.description ||
                            'Trang bị 8-bit giới hạn, ưu đãi độc quyền FlashMart.'}
                        </p>

                        {/* Price block */}
                        <div className="p-2.5 bg-bg-inset border-2 border-outline mb-4 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-pixel text-[16px] text-pixel-yellow font-bold">
                              {salePrice.toLocaleString('vi-VN')} đ
                            </span>
                            <span className="font-pixel text-[16px] text-pixel-green font-bold">
                              -{discountPercent}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[16px] text-text-muted">
                            <span className="line-through">
                              {originalPrice.toLocaleString('vi-VN')} đ
                            </span>
                            <span>Giá gốc</span>
                          </div>
                        </div>

                        {/* Stock Progress Bar */}
                        <div className="mb-5">
                          <PixelProgressBar
                            current={soldCount}
                            total={item.totalQuantity}
                            label="Đã bán"
                            showPercent
                          />
                        </div>
                      </div>

                      {/* Action Button */}
                      <div>
                        <PixelButton
                          variant={isSoldOut ? 'secondary' : 'primary'}
                          disabled={isSoldOut}
                          onClick={() => handleOpenHuntModal(item, product)}
                          className="w-full"
                        >
                          {isSoldOut ? 'Đã cháy hàng' : 'Săn ngay'}
                        </PixelButton>
                      </div>
                    </PixelCard>
                  );
                })}
              </div>
            )}
          </article>
        ))}
      </section>

      {/* Hunt Sale Modal */}
      <HuntSaleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
        product={selectedProduct}
        onSuccess={() => fetchActiveCampaigns()}
      />
    </div>
  );
};
