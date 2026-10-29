package com.hcmus.FlashMart_API.infrastructure.web;

import com.hcmus.FlashMart_API.domain.common.PagedResult;
import com.hcmus.FlashMart_API.domain.entity.Product;
import com.hcmus.FlashMart_API.infrastructure.dto.CreateProductRequest;
import com.hcmus.FlashMart_API.usecase.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tools.jackson.databind.json.JsonMapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ProductControllerTest {
    private MockMvc mockMvc;
    private final JsonMapper json = JsonMapper.builder().build();

    @Mock CreateProductUseCase createProductUseCase;
    @Mock DeleteProductUseCase deleteProductUseCase;
    @Mock GetProductsUseCase getProductsUseCase;
    @Mock GetProductByIdUseCase getProductByIdUseCase;
    @InjectMocks ProductController productController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(productController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("Tạo sản phẩm hợp lệ -> 201 + Location")
    void createProduct_valid_returns201() throws Exception {
        var request = new CreateProductRequest("Bàn phím cơ", "Không dây", BigDecimal.valueOf(1500000), 50);
        UUID id = UUID.randomUUID();
        Product saved = Product.restore(id, "Bàn phím cơ", "Không dây", BigDecimal.valueOf(1500000), 50, LocalDateTime.now());
        when(createProductUseCase.execute(any(CreateProductCommand.class))).thenReturn(saved);

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", org.hamcrest.Matchers.endsWith("/api/v1/products/" + id)))
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.name").value("Bàn phím cơ"))
                .andExpect(jsonPath("$.originalPrice").value(1500000))
                .andExpect(jsonPath("$.generalStock").value(50));

        verify(createProductUseCase).execute(any(CreateProductCommand.class));
    }

    @Test
    @DisplayName("Thiếu tên / giá âm -> 400, không gọi use case")
    void createProduct_invalid_returns400() throws Exception {
        var request = new CreateProductRequest("", null, BigDecimal.valueOf(-1), -5);
        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(createProductUseCase);
    }

    @Test
    @DisplayName("GET /api/v1/products trả về trang sản phẩm")
    void getProducts_returnsPagedResult() throws Exception {
        UUID id = UUID.randomUUID();
        Product p = Product.restore(id, "Chuột gaming", "RGB", BigDecimal.valueOf(500000), 20, LocalDateTime.now());
        when(getProductsUseCase.execute(0, 10))
                .thenReturn(new PagedResult<>(List.of(p), 0, 10, 1, 1));

        mockMvc.perform(get("/api/v1/products").param("page", "0").param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.items[0].name").value("Chuột gaming"));
    }
}
