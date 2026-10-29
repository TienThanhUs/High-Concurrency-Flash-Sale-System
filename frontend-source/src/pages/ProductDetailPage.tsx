import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  PixelButton,
  PixelBadge,
  PixelProgressBar,
  CountdownTimer,
  ProductImage,
  PixelLoading,
  PixelError,
} from '../components/ui';
import { PixelIconZap, PixelIconFlame } from '../components/icons/PixelIcon';
import { HuntSaleModal } from '../components/campaign/HuntSaleModal';
import { productService, campaignService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { parseApiError } from '../utils/errorHandler';
import { Product } from '../types/product';
import { Campaign, CampaignItem } from '../types/campaign';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [activeCampaignItem, setActiveCampaignItem] = useState<{
    campaign: Campaign;
    item: CampaignItem;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHuntModalOpen, setIsHuntModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Product Detail
      const p = await productService.getProductById(id);
      setProduct(p);

      // 2. Fetch Active Campaigns to check if product is on sale
      const campaigns = await campaignService.getActiveCampaigns();
      let matchedSale: { campaign: Campaign; item: CampaignItem } | null = null;

      for (const c of campaigns) {
        const found = c.items.find((i) => i.productId === id);
        if (found) {
          matchedSale = { campaign: c, item: found };
          break;
        }
      }
      setActiveCampaignItem(matchedSale);
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStartHunt = () => {
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để săn sản phẩm!', 'warning');
      navigate('/login', { state: { from: location } });
      return;
    }
    setIsHuntModalOpen(true);
  };

  if (loading) {
    return <PixelLoading message="Đang nạp thông tin trang bị..." className="py-20" />;
  }

  if (error || !product) {
    return (
      <div className="py-12">
        <PixelError message={error || 'Không tìm thấy sản phẩm!'} onRetry={loadData} />
      </div>
    );
  }

  const isFlashSale = !!activeCampaignItem;
  const campaignItem = activeCampaignItem?.item;
  const campaign = activeCampaignItem?.campaign;

  const salePrice = campaignItem ? campaignItem.flashSalePrice : product.originalPrice;
  const originalPrice = product.originalPrice;
  const discountPercent = isFlashSale
    ? Math.max(1, Math.round(((originalPrice - salePrice) / originalPrice) * 100))
    : 0;

  const isSoldOut = isFlashSale ? campaignItem!.availableQuantity <= 0 : product.generalStock <= 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-pixel text-[16px] text-text-muted">
        <Link to="/products" className="hover:text-text-main underline">
          Sản phẩm
        </Link>
        <span>/</span>
        <span className="text-pixel-yellow truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Product Avatar Box */}
        <div className="pixel-box p-8 flex flex-col items-center justify-center bg-bg-panel border-4 border-outline">
          <ProductImage productId={product.id} name={product.name} size={160} />
          <div className="mt-4 flex items-center gap-2">
            <PixelBadge variant={isFlashSale ? 'yellow' : 'blue'}>
              {isFlashSale ? 'Sản phẩm Flash Sale' : 'Hàng tiêu chuẩn'}
            </PixelBadge>
            <span className="font-pixel text-[16px] text-text-muted">
              Mã: {product.id.slice(0, 8)}
            </span>
          </div>
        </div>

        {/* Product Details & Actions */}
        <div className="space-y-6">
          <div>
            <h1 className="font-pixel text-[24px] md:text-[32px] text-text-main font-bold mb-2">
              {product.name}
            </h1>
            <p className="font-body text-[16px] text-text-muted leading-relaxed">
              {product.description ||
                'Sản phẩm 8-bit chất lượng cao, tối ưu cho các tín đồ săn sale.'}
            </p>
          </div>

          {/* Flash Sale Banner if Active */}
          {isFlashSale && campaign && campaignItem && (
            <div className="p-4 bg-bg-panel-light border-3 border-pixel-yellow shadow-pixel-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 font-pixel text-[16px] text-pixel-yellow font-bold">
                  <PixelIconFlame size={16} /> {campaign.name}
                </span>
                <PixelBadge variant="green">Đang mở</PixelBadge>
              </div>

              {/* Price comparison */}
              <div className="flex items-baseline gap-3">
                <span className="font-pixel text-[24px] text-pixel-yellow font-bold">
                  {salePrice.toLocaleString('vi-VN')} đ
                </span>
                <span className="text-[16px] text-text-muted line-through">
                  {originalPrice.toLocaleString('vi-VN')} đ
                </span>
                <span className="font-pixel text-[16px] text-pixel-red-light bg-pixel-red/20 px-1.5 py-0.5 border border-pixel-red">
                  Tiết kiệm {discountPercent}%
                </span>
              </div>

              {/* Countdown timer */}
              <div className="pt-2 border-t border-outline/50">
                <CountdownTimer endTime={campaign.endTime} label="Kết thúc sau" />
              </div>

              {/* Flash sale stock */}
              <div className="pt-1">
                <PixelProgressBar
                  current={campaignItem.totalQuantity - campaignItem.availableQuantity}
                  total={campaignItem.totalQuantity}
                  label="Đã bán"
                />
              </div>
            </div>
          )}

          {/* Standard Price info if not in flash sale */}
          {!isFlashSale && (
            <div className="p-4 bg-bg-inset border-3 border-outline space-y-2">
              <span className="font-pixel text-[16px] text-text-muted block">Giá niêm yết:</span>
              <span className="font-pixel text-[24px] text-pixel-yellow font-bold">
                {product.originalPrice.toLocaleString('vi-VN')} đ
              </span>
              <p className="font-body text-[16px] text-text-muted">
                Tồn kho hiện có: <strong className="text-text-main">{product.generalStock}</strong>{' '}
                sản phẩm
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-2">
            {isFlashSale && campaignItem ? (
              <PixelButton
                variant={isSoldOut ? 'secondary' : 'primary'}
                size="lg"
                disabled={isSoldOut}
                onClick={handleStartHunt}
                className="w-full flex items-center justify-center gap-2"
              >
                <PixelIconZap size={18} />
                <span>{isSoldOut ? 'Đã hết hàng trong kho' : 'Săn ngay với giá Flash Sale'}</span>
              </PixelButton>
            ) : (
              <div className="p-3 bg-bg-panel border-2 border-outline text-center">
                <p className="font-pixel text-[16px] text-text-muted">
                  Sản phẩm chưa có trong chiến dịch flash sale nào đang mở.
                </p>
                <Link
                  to="/"
                  className="inline-block mt-2 font-pixel text-[16px] text-pixel-green hover:underline"
                >
                  Xem các sản phẩm đang Flash Sale ▶
                </Link>
              </div>
            )}

            <Link to="/products" className="block text-center">
              <PixelButton variant="secondary" size="sm" className="w-full">
                ◀ Quay lại danh mục sản phẩm
              </PixelButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Hunt Sale Modal */}
      {isFlashSale && campaignItem && (
        <HuntSaleModal
          isOpen={isHuntModalOpen}
          onClose={() => setIsHuntModalOpen(false)}
          item={campaignItem}
          product={product}
          onSuccess={() => loadData()}
        />
      )}
    </div>
  );
};
