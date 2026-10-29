package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.common.PagedResult;
import com.hcmus.FlashMart_API.domain.entity.Product;

public interface GetProductsUseCase {
    PagedResult<Product> execute(int page, int size);
}
