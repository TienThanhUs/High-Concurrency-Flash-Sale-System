package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.common.PagedResult;
import com.hcmus.FlashMart_API.domain.entity.Product;
import com.hcmus.FlashMart_API.domain.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GetProductsUseCaseImpl implements GetProductsUseCase {
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public PagedResult<Product> execute(int page, int size) {
        if (page < 0) {
            throw new IllegalArgumentException("Số trang không hợp lệ");
        }
        if (size <= 0 || size > 100) {
            throw new IllegalArgumentException("Kích thước trang phải từ 1 đến 100");
        }
        return productRepository.findPage(page, size);
    }
}
