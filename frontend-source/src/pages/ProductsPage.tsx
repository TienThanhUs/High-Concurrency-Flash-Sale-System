import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  PixelButton,
  PixelCard,
  PixelBadge,
  ProductImage,
  PixelLoading,
  PixelEmpty,
  PixelError,
} from '../components/ui';
import { productService } from '../services/api';
import { parseApiError } from '../utils/errorHandler';
import { Product, PagedResult } from '../types/product';

export const ProductsPage: React.FC = () => {
  const [data, setData] = useState<PagedResult<Product> | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 12;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await productService.getProducts(targetPage, pageSize);
      setData(res);
      setPage(targetPage);
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(page);
  }, [page, fetchProducts]);

  if (loading) {
    return <PixelLoading message="Đang tải danh sách trang bị..." className="py-20" />;
  }

  if (error) {
    return (
      <div className="py-12">
        <PixelError message={error} onRetry={() => fetchProducts(page)} />
      </div>
    );
  }

  const products = data?.items || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-3 border-outline">
        <div>
          <h1 className="font-pixel text-[24px] md:text-[32px] text-text-main font-bold">
            Tất cả sản phẩm ({data?.totalElements || 0})
          </h1>
          <p className="font-body text-[16px] text-text-muted mt-0.5">
            Danh mục sản phẩm chính hãng trong kho FlashMart
          </p>
        </div>
        <PixelBadge variant="blue">Kho chính</PixelBadge>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <PixelEmpty
          title="Chưa có sản phẩm nào"
          message="Hệ thống kho đang cập nhật danh mục sản phẩm mới."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => {
            const inStock = p.generalStock > 0;
            return (
              <PixelCard
                key={p.id}
                className="flex flex-col justify-between hover:-translate-y-1 transition-transform"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <ProductImage productId={p.id} name={p.name} size={64} />
                    <PixelBadge variant={inStock ? 'green' : 'red'}>
                      {inStock ? `Còn ${p.generalStock}` : 'Hết hàng'}
                    </PixelBadge>
                  </div>

                  <h3 className="font-pixel text-[16px] text-text-main font-bold line-clamp-2 min-h-[44px] mb-1">
                    {p.name}
                  </h3>
                  <p className="font-body text-[16px] text-text-muted line-clamp-2 min-h-[48px] mb-3">
                    {p.description || 'Sản phẩm tiêu chuẩn chất lượng cao.'}
                  </p>

                  <div className="p-2 bg-bg-inset border-2 border-outline mb-4">
                    <span className="text-[16px] text-text-muted block">Giá niêm yết:</span>
                    <span className="font-pixel text-[16px] text-pixel-yellow font-bold">
                      {p.originalPrice.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>

                <Link to={`/products/${p.id}`} className="block w-full">
                  <PixelButton variant="secondary" size="sm" className="w-full">
                    Xem chi tiết
                  </PixelButton>
                </Link>
              </PixelCard>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t-3 border-outline">
          <PixelButton
            variant="secondary"
            size="sm"
            disabled={page <= 0}
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
          >
            ◀ Trang trước
          </PixelButton>

          <span className="font-pixel text-[16px] text-text-muted">
            Trang <strong className="text-pixel-yellow">{page + 1}</strong> / {data.totalPages}
          </span>

          <PixelButton
            variant="secondary"
            size="sm"
            disabled={page >= data.totalPages - 1}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Trang sau ▶
          </PixelButton>
        </div>
      )}
    </div>
  );
};
