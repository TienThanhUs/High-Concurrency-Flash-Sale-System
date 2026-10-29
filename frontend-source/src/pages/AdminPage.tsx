import React, { useEffect, useState, useCallback } from 'react';
import {
  PixelButton,
  PixelInput,
  PixelCard,
  PixelBadge,
  PixelModal,
  PixelLoading,
  ProductImage,
} from '../components/ui';
import {
  PixelIconShield,
  PixelIconPlus,
  PixelIconTrash,
  PixelIconClock,
  PixelIconZap,
} from '../components/icons/PixelIcon';
import { productService, campaignService } from '../services/api';
import { useToast } from '../hooks/useToast';
import { parseApiError } from '../utils/errorHandler';
import { Product } from '../types/product';
import { Campaign, CampaignStatus } from '../types/campaign';

type AdminTab = 'products' | 'campaigns' | 'reconcile';

export const AdminPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>('products');

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('');
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  // Campaigns state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [newCampName, setNewCampName] = useState('');
  const [newCampStart, setNewCampStart] = useState('');
  const [newCampEnd, setNewCampEnd] = useState('');
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);

  // Add Item to Campaign Modal state
  const [selectedCampForAddItem, setSelectedCampForAddItem] = useState<Campaign | null>(null);
  const [addItemProductId, setAddItemProductId] = useState('');
  const [addItemSalePrice, setAddItemSalePrice] = useState('');
  const [addItemQuantity, setAddItemQuantity] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Reconcile state
  const [isReconciling, setIsReconciling] = useState(false);
  const [reconcileResult, setReconcileResult] = useState<number | null>(null);

  // Delete product confirmation
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Load products
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await productService.getProducts(0, 100);
      setProducts(res.items);
    } catch (err) {
      const parsed = parseApiError(err);
      showToast(parsed.message, 'error');
    } finally {
      setLoadingProducts(false);
    }
  }, [showToast]);

  // Load active campaigns
  const fetchCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    try {
      const list = await campaignService.getActiveCampaigns();
      setCampaigns(list);
    } catch (err) {
      const parsed = parseApiError(err);
      showToast(parsed.message, 'error');
    } finally {
      setLoadingCampaigns(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchProducts();
    fetchCampaigns();
  }, [fetchProducts, fetchCampaigns]);

  // Create Product handler
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim() || !newProductPrice || !newProductStock) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc!', 'warning');
      return;
    }

    setIsCreatingProduct(true);
    try {
      const created = await productService.createProduct({
        name: newProductName.trim(),
        description: newProductDesc.trim() || undefined,
        originalPrice: parseFloat(newProductPrice),
        generalStock: parseInt(newProductStock, 10),
      });

      showToast(`Đã thêm sản phẩm "${created.name}" thành công!`, 'success');
      setNewProductName('');
      setNewProductDesc('');
      setNewProductPrice('');
      setNewProductStock('');
      fetchProducts();
    } catch (err) {
      const parsed = parseApiError(err);
      showToast(parsed.message, 'error');
    } finally {
      setIsCreatingProduct(false);
    }
  };

  // Delete Product handler
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      await productService.deleteProduct(deletingProduct.id);
      showToast(`Đã xóa sản phẩm "${deletingProduct.name}"!`, 'info');
      setDeletingProduct(null);
      fetchProducts();
    } catch (err) {
      const parsed = parseApiError(err);
      showToast(parsed.message, 'error');
    }
  };

  // Create Campaign handler
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampName.trim() || !newCampStart || !newCampEnd) {
      showToast('Vui lòng điền tên và thời gian chiến dịch!', 'warning');
      return;
    }

    setIsCreatingCampaign(true);
    try {
      // Backend expects format: "yyyy-MM-ddTHH:mm:ss"
      const formatIso = (val: string) => {
        return val.length === 16 ? `${val}:00` : val;
      };

      const created = await campaignService.createCampaign({
        name: newCampName.trim(),
        startTime: formatIso(newCampStart),
        endTime: formatIso(newCampEnd),
      });

      showToast(`Đã tạo chiến dịch "${created.name}"! Trạng thái: UPCOMING.`, 'success');
      setNewCampName('');
      setNewCampStart('');
      setNewCampEnd('');
      fetchCampaigns();
    } catch (err) {
      const parsed = parseApiError(err);
      showToast(parsed.message, 'error');
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  // Update Campaign Status
  const handleUpdateCampaignStatus = async (campId: string, status: CampaignStatus) => {
    try {
      await campaignService.updateCampaignStatus(campId, { status });
      showToast(`Đã chuyển trạng thái chiến dịch sang ${status}!`, 'success');
      fetchCampaigns();
    } catch (err) {
      const parsed = parseApiError(err);
      showToast(parsed.message, 'error');
    }
  };

  // Add Item to Campaign
  const handleAddItemToCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampForAddItem || !addItemProductId || !addItemSalePrice || !addItemQuantity) {
      showToast('Vui lòng nhập đủ các thông tin item flash sale!', 'warning');
      return;
    }

    setIsAddingItem(true);
    try {
      await campaignService.addCampaignItem(selectedCampForAddItem.id, {
        productId: addItemProductId,
        flashSalePrice: parseFloat(addItemSalePrice),
        totalQuantity: parseInt(addItemQuantity, 10),
      });

      showToast('Đã thêm sản phẩm vào chiến dịch flash sale!', 'success');
      setSelectedCampForAddItem(null);
      setAddItemProductId('');
      setAddItemSalePrice('');
      setAddItemQuantity('');
      fetchCampaigns();
    } catch (err) {
      const parsed = parseApiError(err);
      showToast(parsed.message, 'error');
    } finally {
      setIsAddingItem(false);
    }
  };

  // Reconcile Inventory
  const handleReconcile = async () => {
    setIsReconciling(true);
    try {
      const res = await campaignService.reconcileInventory();
      setReconcileResult(res.reconciledItems);
      showToast(`Đồng bộ kho hoàn tất: ${res.reconciledItems} sản phẩm đã cân bằng!`, 'success');
    } catch (err) {
      const parsed = parseApiError(err);
      showToast(parsed.message, 'error');
    } finally {
      setIsReconciling(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b-3 border-outline">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 bg-pixel-yellow text-text-on-accent border-2 border-outline">
            <PixelIconShield size={20} />
          </span>
          <div>
            <h1 className="font-pixel text-[24px] md:text-[32px] text-text-main font-bold">
              Bảng quản trị Admin
            </h1>
            <p className="font-body text-[16px] text-text-muted mt-0.5">
              Quản lý sản phẩm, chiến dịch Flash Sale và đồng bộ kho Redis
            </p>
          </div>
        </div>
        <PixelBadge variant="yellow">Role: Admin</PixelBadge>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`px-3.5 py-1.5 font-pixel text-[16px] font-bold border-2 border-outline transition-transform ${
            activeTab === 'products'
              ? 'bg-pixel-green text-[#10240d] [text-shadow:1px_1px_0_rgba(255,255,255,0.4)] translate-x-0.5 translate-y-0.5'
              : 'bg-bg-panel text-text-muted hover:text-text-main'
          }`}
        >
          1. Sản phẩm ({products.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('campaigns')}
          className={`px-3.5 py-1.5 font-pixel text-[16px] font-bold border-2 border-outline transition-transform ${
            activeTab === 'campaigns'
              ? 'bg-pixel-green text-[#10240d] [text-shadow:1px_1px_0_rgba(255,255,255,0.4)] translate-x-0.5 translate-y-0.5'
              : 'bg-bg-panel text-text-muted hover:text-text-main'
          }`}
        >
          2. Chiến dịch Flash Sale ({campaigns.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reconcile')}
          className={`px-3.5 py-1.5 font-pixel text-[16px] font-bold border-2 border-outline transition-transform ${
            activeTab === 'reconcile'
              ? 'bg-pixel-green text-[#10240d] [text-shadow:1px_1px_0_rgba(255,255,255,0.4)] translate-x-0.5 translate-y-0.5'
              : 'bg-bg-panel text-text-muted hover:text-text-main'
          }`}
        >
          3. Đồng bộ kho Redis
        </button>
      </div>

      {/* TAB 1: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Create Product Form */}
          <PixelCard title="Thêm sản phẩm mới vào kho" headerIcon={<PixelIconPlus size={16} />}>
            <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PixelInput
                label="Tên sản phẩm"
                placeholder="Ví dụ: Bàn phím cơ Pixel Retro"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                required
              />
              <PixelInput
                label="Giá niêm yết (VNĐ)"
                type="number"
                placeholder="100000"
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(e.target.value)}
                required
              />
              <PixelInput
                label="Tồn kho ban đầu"
                type="number"
                placeholder="50"
                value={newProductStock}
                onChange={(e) => setNewProductStock(e.target.value)}
                required
              />
              <PixelInput
                label="Mô tả sản phẩm"
                placeholder="Mô tả tính năng ngắn gọn..."
                value={newProductDesc}
                onChange={(e) => setNewProductDesc(e.target.value)}
              />
              <div className="md:col-span-2 pt-2">
                <PixelButton
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isCreatingProduct}
                >
                  Tạo sản phẩm mới
                </PixelButton>
              </div>
            </form>
          </PixelCard>

          {/* Product List */}
          <PixelCard title="Danh sách sản phẩm hiện có">
            {loadingProducts ? (
              <PixelLoading message="Đang nạp danh sách sản phẩm..." />
            ) : products.length === 0 ? (
              <p className="font-body text-[16px] text-text-muted">Chưa có sản phẩm nào.</p>
            ) : (
              <div className="space-y-3">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-bg-inset border-2 border-outline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <ProductImage productId={p.id} name={p.name} size={48} />
                      <div>
                        <h4 className="font-pixel text-[16px] md:text-[24px] text-text-main font-bold">
                          {p.name}
                        </h4>
                        <span className="font-body text-[16px] text-text-muted">
                          Giá: {p.originalPrice.toLocaleString('vi-VN')} đ • Tồn kho:{' '}
                          {p.generalStock}
                        </span>
                        <span className="font-pixel text-[16px] text-text-muted/60 block">
                          ID: {p.id}
                        </span>
                      </div>
                    </div>
                    <PixelButton variant="danger" size="sm" onClick={() => setDeletingProduct(p)}>
                      <PixelIconTrash size={16} /> Xóa
                    </PixelButton>
                  </div>
                ))}
              </div>
            )}
          </PixelCard>
        </div>
      )}

      {/* TAB 2: CAMPAIGNS MANAGEMENT */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          {/* Create Campaign Form */}
          <PixelCard
            title="Tạo chiến dịch Flash Sale mới"
            headerIcon={<PixelIconClock size={16} />}
          >
            <form onSubmit={handleCreateCampaign} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PixelInput
                label="Tên chiến dịch"
                placeholder="Ví dụ: Giờ vàng 12h"
                value={newCampName}
                onChange={(e) => setNewCampName(e.target.value)}
                required
              />
              <PixelInput
                label="Thời gian bắt đầu (Giờ VN)"
                type="datetime-local"
                value={newCampStart}
                onChange={(e) => setNewCampStart(e.target.value)}
                required
              />
              <PixelInput
                label="Thời gian kết thúc (Giờ VN)"
                type="datetime-local"
                value={newCampEnd}
                onChange={(e) => setNewCampEnd(e.target.value)}
                required
              />
              <div className="md:col-span-3 pt-2">
                <PixelButton
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isCreatingCampaign}
                >
                  Tạo chiến dịch
                </PixelButton>
              </div>
            </form>
          </PixelCard>

          {/* Active Campaigns */}
          <PixelCard title="Chiến dịch đang mở & Thêm sản phẩm">
            {loadingCampaigns ? (
              <PixelLoading message="Đang nạp danh sách chiến dịch..." />
            ) : campaigns.length === 0 ? (
              <p className="font-body text-[16px] text-text-muted">
                Hiện không có chiến dịch nào ở trạng thái ACTIVE. Bạn có thể tạo mới ở trên.
              </p>
            ) : (
              <div className="space-y-4">
                {campaigns.map((camp) => (
                  <div key={camp.id} className="p-4 bg-bg-inset border-2 border-outline space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-outline/50 pb-2">
                      <div>
                        <h4 className="font-pixel text-[16px] md:text-[24px] text-pixel-yellow font-bold">
                          {camp.name}
                        </h4>
                        <span className="font-body text-[16px] text-text-muted">
                          ID: {camp.id} • {camp.items.length} items flash sale
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PixelBadge variant="green">{camp.status}</PixelBadge>
                        <PixelButton
                          variant="secondary"
                          size="sm"
                          onClick={() => handleUpdateCampaignStatus(camp.id, 'ENDED')}
                        >
                          Kết thúc ngay (Ended)
                        </PixelButton>
                        <PixelButton
                          variant="primary"
                          size="sm"
                          onClick={() => setSelectedCampForAddItem(camp)}
                        >
                          + Gán sản phẩm sale
                        </PixelButton>
                      </div>
                    </div>

                    {/* Items inside campaign */}
                    {camp.items.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {camp.items.map((it) => (
                          <div
                            key={it.id}
                            className="p-2.5 bg-bg-panel border border-outline text-[16px] space-y-1"
                          >
                            <p className="font-bold text-text-main truncate">
                              Item ID: {it.id.slice(0, 8)}... (Product: {it.productId.slice(0, 8)}
                              ...)
                            </p>
                            <p className="text-text-muted flex justify-between">
                              <span>
                                Giá sale:{' '}
                                <strong className="text-pixel-green font-pixel text-[16px]">
                                  {it.flashSalePrice.toLocaleString('vi-VN')} đ
                                </strong>
                              </span>
                              <span>
                                Tồn kho:{' '}
                                <strong>
                                  {it.availableQuantity} / {it.totalQuantity}
                                </strong>
                              </span>
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </PixelCard>
        </div>
      )}

      {/* TAB 3: RECONCILE */}
      {activeTab === 'reconcile' && (
        <PixelCard title="Đồng bộ tồn kho Redis & CSDL (Reconcile)">
          <div className="space-y-4 max-w-xl">
            <p className="font-body text-[16px] text-text-muted leading-relaxed">
              Tính năng này gọi tới endpoint{' '}
              <code className="text-pixel-yellow font-bold">POST /api/v1/campaigns/reconcile</code>.
              Hệ thống sẽ đồng bộ số lượng tồn kho flash sale từ cơ sở dữ liệu PostgreSQL sang Redis
              để đảm bảo không bị lệch kho khi chịu tải cao.
            </p>

            <PixelButton
              variant="accent"
              size="md"
              onClick={handleReconcile}
              isLoading={isReconciling}
              className="flex items-center gap-2"
            >
              <PixelIconZap size={16} />
              <span>Bắt đầu đồng bộ toàn bộ chiến dịch Active</span>
            </PixelButton>

            {reconcileResult !== null && (
              <div className="p-3 bg-pixel-green/20 border-2 border-pixel-green text-pixel-green font-pixel text-[16px]">
                ✔ Đã hoàn tất đồng bộ! Số sản phẩm được cập nhật: <strong>{reconcileResult}</strong>
              </div>
            )}
          </div>
        </PixelCard>
      )}

      {/* Delete Product Confirmation Modal */}
      <PixelModal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        title="Xác nhận xóa sản phẩm"
        footer={
          <>
            <PixelButton variant="secondary" size="sm" onClick={() => setDeletingProduct(null)}>
              Hủy
            </PixelButton>
            <PixelButton variant="danger" size="sm" onClick={handleDeleteProduct}>
              Xác nhận xóa
            </PixelButton>
          </>
        }
      >
        <p>
          Bạn có chắc chắn muốn xóa sản phẩm <strong>"{deletingProduct?.name}"</strong> khỏi hệ
          thống?
        </p>
      </PixelModal>

      {/* Add Item to Campaign Modal */}
      <PixelModal
        isOpen={!!selectedCampForAddItem}
        onClose={() => setSelectedCampForAddItem(null)}
        title={`Gán sản phẩm vào: ${selectedCampForAddItem?.name}`}
      >
        <form onSubmit={handleAddItemToCampaign} className="space-y-4">
          <div className="space-y-1">
            <label className="font-pixel text-[16px] text-text-muted block font-bold">
              Chọn sản phẩm trong kho:
            </label>
            <select
              value={addItemProductId}
              onChange={(e) => setAddItemProductId(e.target.value)}
              required
              className="w-full font-body text-[16px] text-text-main bg-bg-inset border-3 border-outline p-2.5 outline-none rounded-none"
            >
              <option value="">-- Chọn sản phẩm --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Giá gốc: {p.originalPrice.toLocaleString('vi-VN')} đ)
                </option>
              ))}
            </select>
          </div>

          <PixelInput
            label="Giá Flash Sale (VNĐ)"
            type="number"
            placeholder="Ví dụ: 49000"
            value={addItemSalePrice}
            onChange={(e) => setAddItemSalePrice(e.target.value)}
            required
          />

          <PixelInput
            label="Số lượng mở bán trong đợt (Quantity)"
            type="number"
            placeholder="Ví dụ: 20"
            value={addItemQuantity}
            onChange={(e) => setAddItemQuantity(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <PixelButton
              variant="secondary"
              size="sm"
              onClick={() => setSelectedCampForAddItem(null)}
              disabled={isAddingItem}
            >
              Hủy
            </PixelButton>
            <PixelButton type="submit" variant="primary" size="sm" isLoading={isAddingItem}>
              Xác nhận gán
            </PixelButton>
          </div>
        </form>
      </PixelModal>
    </div>
  );
};
