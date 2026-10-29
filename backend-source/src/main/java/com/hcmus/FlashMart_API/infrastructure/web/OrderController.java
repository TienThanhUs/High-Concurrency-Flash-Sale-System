package com.hcmus.FlashMart_API.infrastructure.web;

import com.hcmus.FlashMart_API.domain.entity.Order;
import com.hcmus.FlashMart_API.infrastructure.dto.OrderResponse;
import com.hcmus.FlashMart_API.infrastructure.dto.PlaceOrderRequest;
import com.hcmus.FlashMart_API.infrastructure.dto.PlaceOrderResponse;
import com.hcmus.FlashMart_API.infrastructure.security.UserPrincipal;
import com.hcmus.FlashMart_API.usecase.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final PlaceOrderUseCase placeOrderUseCase;
    private final GetMyOrdersUseCase getMyOrdersUseCase;
    private final GetOrderByIdUseCase getOrderByIdUseCase;
    private final CancelOrderUseCase cancelOrderUseCase;

    @PostMapping
    public ResponseEntity<PlaceOrderResponse> placeOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PlaceOrderRequest request) {
        PlaceOrderUseCase.Result result = placeOrderUseCase.execute(principal.getId(), request.campaignItemId());
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(PlaceOrderResponse.from(result));
    }

    @GetMapping("/me")
    public ResponseEntity<List<OrderResponse>> getMyOrders(@AuthenticationPrincipal UserPrincipal principal) {
        List<OrderResponse> orders = getMyOrdersUseCase.execute(principal.getId()).stream()
                .map(OrderResponse::from)
                .toList();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Order order = getOrderByIdUseCase.execute(id, principal.getId(), principal.getRole());
        return ResponseEntity.ok(OrderResponse.from(order));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Order cancelled = cancelOrderUseCase.execute(id, principal.getId(), principal.getRole());
        return ResponseEntity.ok(OrderResponse.from(cancelled));
    }
}
