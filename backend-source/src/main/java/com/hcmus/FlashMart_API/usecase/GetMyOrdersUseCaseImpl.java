package com.hcmus.FlashMart_API.usecase;

import com.hcmus.FlashMart_API.domain.entity.Order;
import com.hcmus.FlashMart_API.domain.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GetMyOrdersUseCaseImpl implements GetMyOrdersUseCase {
    private final OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Order> execute(Long userId) {
        return orderRepository.findByUserId(userId);
    }
}
