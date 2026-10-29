package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.exception.ResourceNotFoundException;
import com.hcmus.FlashMart_API.domain.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeleteProductUseCaseImpl implements DeleteProductUseCase{

    private final ProductRepository repository;
    @Override
    public void execute(UUID id) {
        if(!repository.existsById(id))
        {
            throw new ResourceNotFoundException("Khong ton tai san pham nay !!!");
        }
        repository.deleteById(id);
    }
}
