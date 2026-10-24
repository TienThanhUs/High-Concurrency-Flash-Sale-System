package com.hcmus.FlashMart_API.infrastructure.web;

import com.hcmus.FlashMart_API.domain.common.PagedResult;
import com.hcmus.FlashMart_API.domain.entity.Product;
import com.hcmus.FlashMart_API.infrastructure.dto.CreateProductRequest;
import com.hcmus.FlashMart_API.infrastructure.dto.ProductResponse;
import com.hcmus.FlashMart_API.usecase.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/products")
public class ProductController {
    private final CreateProductUseCase createProductUseCase;
    private final DeleteProductUseCase deleteProductUseCase;
    private final GetProductsUseCase getProductsUseCase;
    private final GetProductByIdUseCase getProductByIdUseCase;

    @GetMapping
    public ResponseEntity<PagedResult<ProductResponse>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedResult<Product> result = getProductsUseCase.execute(page, size);
        List<ProductResponse> items = result.items().stream().map(ProductResponse::from).toList();
        return ResponseEntity.ok(new PagedResult<>(
                items, result.page(), result.size(), result.totalElements(), result.totalPages()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable UUID id) {
        return ResponseEntity.ok(ProductResponse.from(getProductByIdUseCase.execute(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody CreateProductRequest request) {
        Product saved = createProductUseCase.execute(new CreateProductCommand(
                request.name(), request.description(), request.originalPrice(), request.generalStock()));
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(saved.getId()).toUri();
        return ResponseEntity.created(location).body(ProductResponse.from(saved));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID id) {
        deleteProductUseCase.execute(id);
        return ResponseEntity.noContent().build();
    }
}
