package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.entity.Product;
import com.hcmus.FlashMart_API.domain.exception.ResourceNotFoundException;
import com.hcmus.FlashMart_API.domain.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetProductByIdUseCaseImpl implements GetProductByIdUseCase {
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public Product execute(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tồn tại sản phẩm với id: " + id));
    }
}
