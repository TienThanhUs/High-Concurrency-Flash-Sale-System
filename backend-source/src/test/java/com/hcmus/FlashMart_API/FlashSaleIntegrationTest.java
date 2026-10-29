package com.hcmus.FlashMart_API;

import com.hcmus.FlashMart_API.domain.entity.*;
import com.hcmus.FlashMart_API.domain.exception.ConflictException;
import com.hcmus.FlashMart_API.domain.repository.CampaignItemRepository;
import com.hcmus.FlashMart_API.domain.repository.FlashSaleInventoryPort;
import com.hcmus.FlashMart_API.domain.security.TokenGenerator;
import com.hcmus.FlashMart_API.infrastructure.dto.*;
import com.hcmus.FlashMart_API.infrastructure.persistence.OrderJpaRepository;
import com.hcmus.FlashMart_API.infrastructure.persistence.UserJpaEntity;
import com.hcmus.FlashMart_API.infrastructure.persistence.UserJpaRepository;
import com.hcmus.FlashMart_API.usecase.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import tools.jackson.databind.json.JsonMapper;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.awaitility.Awaitility.await;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class FlashSaleIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserJpaRepository userJpaRepository;
    @Autowired private OrderJpaRepository orderJpaRepository;
    @Autowired private CampaignItemRepository campaignItemRepository;
    @Autowired private FlashSaleInventoryPort inventoryPort;
    @Autowired private TokenGenerator tokenGenerator;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private CreateProductUseCase createProductUseCase;
    @Autowired private CreateCampaignUseCase createCampaignUseCase;
    @Autowired private AddCampaignItemUseCase addCampaignItemUseCase;
    @Autowired private UpdateCampaignStatusUseCase updateCampaignStatusUseCase;
    @Autowired private PlaceOrderUseCase placeOrderUseCase;
    @Autowired private JdbcTemplate jdbcTemplate;

    private final JsonMapper json = JsonMapper.builder().build();

    private String adminToken;

    @BeforeEach
    void setUpAdmin() {
        UserJpaEntity admin = userJpaRepository.findByEmail("admin-it@flashmart.com")
                .orElseGet(() -> userJpaRepository.save(UserJpaEntity.builder()
                        .username("adminIntegration")
                        .email("admin-it@flashmart.com")
                        .password(passwordEncoder.encode("adminPass123"))
                        .role(Role.ADMIN)
                        .build()));
        adminToken = tokenGenerator.generateToken(admin.getId(), admin.getEmail(), Role.ADMIN);
    }

    @Test
    @DisplayName("RBAC: USER bị 403 khi tạo/xoá sản phẩm hoặc tạo campaign; không có token bị 401")
    void rbac_userCannotCreateOrDeleteProduct() throws Exception {
        var regReq = new RegisterRequest("normalUser01", "normal01@flashmart.com", "password123");
        MvcResult regRes = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(regReq)))
                .andExpect(status().isOk())
                .andReturn();
        String userJwt = json.readTree(regRes.getResponse().getContentAsString()).get("jwt").asText();

        var prodReq = new CreateProductRequest("Tai nghe", "Bluetooth", BigDecimal.valueOf(500000), 10);

        // Unauthenticated -> 401
        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(prodReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value("AUTH-401"));

        // ROLE_USER -> 403 on POST /api/v1/products
        mockMvc.perform(post("/api/v1/products")
                        .header("Authorization", "Bearer " + userJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(prodReq)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode").value("AUTH-403"));

        // ROLE_USER -> 403 on DELETE /api/v1/products/{id}
        mockMvc.perform(delete("/api/v1/products/" + UUID.randomUUID())
                        .header("Authorization", "Bearer " + userJwt))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode").value("AUTH-403"));

        // ROLE_USER -> 403 on POST /api/v1/campaigns
        var campReq = new CreateCampaignRequest("Sale", LocalDateTime.now().minusMinutes(1), LocalDateTime.now().plusHours(1));
        mockMvc.perform(post("/api/v1/campaigns")
                        .header("Authorization", "Bearer " + userJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(campReq)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode").value("AUTH-403"));
    }

    @Test
    @DisplayName("End-to-End: Register -> Login -> Xem campaign -> Đặt hàng -> Ghi DB -> Huỷ đơn hoàn kho")
    void endToEndFlow_registerLoginViewOrderAndCancel() throws Exception {
        // 1. Register
        var regReq = new RegisterRequest("buyerE2EUser", "buyer-e2e@flashmart.com", "secretPass123");
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(regReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jwt").isNotEmpty());

        // Duplicate email -> 409
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(regReq)))
                .andExpect(status().isConflict());

        // 2. Login
        var loginReq = new AuthenticationRequest("buyer-e2e@flashmart.com", "secretPass123");
        MvcResult loginRes = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();
        String buyerJwt = json.readTree(loginRes.getResponse().getContentAsString()).get("jwt").asText();

        // 3. ADMIN creates product, campaign, campaign item, and activates campaign
        MvcResult prodRes = mockMvc.perform(post("/api/v1/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(
                                new CreateProductRequest("MacBook Air M3", "16GB/512GB", BigDecimal.valueOf(28000000), 50))))
                .andExpect(status().isCreated())
                .andReturn();
        UUID productId = UUID.fromString(json.readTree(prodRes.getResponse().getContentAsString()).get("id").asText());

        MvcResult campRes = mockMvc.perform(post("/api/v1/campaigns")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(new CreateCampaignRequest(
                                "Flash Sale E2E",
                                LocalDateTime.now().minusMinutes(5),
                                LocalDateTime.now().plusHours(1)))))
                .andExpect(status().isCreated())
                .andReturn();
        UUID campaignId = UUID.fromString(json.readTree(campRes.getResponse().getContentAsString()).get("id").asText());

        MvcResult itemRes = mockMvc.perform(post("/api/v1/campaigns/" + campaignId + "/items")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(
                                new AddCampaignItemRequest(productId, BigDecimal.valueOf(19990000), 5))))
                .andExpect(status().isCreated())
                .andReturn();
        UUID campaignItemId = UUID.fromString(json.readTree(itemRes.getResponse().getContentAsString()).get("id").asText());

        mockMvc.perform(patch("/api/v1/campaigns/" + campaignId + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(new UpdateCampaignStatusRequest(CampaignStatus.ACTIVE))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        // 4. Public views active campaigns
        mockMvc.perform(get("/api/v1/campaigns/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == '" + campaignId + "')]").exists());

        // 5. Buyer places flash-sale order -> 202 Accepted
        mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + buyerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(new PlaceOrderRequest(campaignItemId))))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.status").value("PENDING"));

        // 6. Wait for Kafka consumer to persist order in PostgreSQL and decrement available_quantity
        await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> {
            CampaignItem updatedItem = campaignItemRepository.findById(campaignItemId).orElseThrow();
            assertEquals(4, updatedItem.getAvailableQuantity());
            assertEquals(4L, inventoryPort.getStock(campaignItemId));
        });

        MvcResult myOrdersRes = mockMvc.perform(get("/api/v1/orders/me")
                        .header("Authorization", "Bearer " + buyerJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("CONFIRMED"))
                .andReturn();
        long orderId = json.readTree(myOrdersRes.getResponse().getContentAsString()).get(0).get("id").asLong();

        // 7. Cancel order -> stock restored in both DB and Redis
        mockMvc.perform(post("/api/v1/orders/" + orderId + "/cancel")
                        .header("Authorization", "Bearer " + buyerJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        CampaignItem afterCancel = campaignItemRepository.findById(campaignItemId).orElseThrow();
        assertEquals(5, afterCancel.getAvailableQuantity());
        assertEquals(5L, inventoryPort.getStock(campaignItemId));
    }

    @Test
    @DisplayName("CHỐNG MUA TRÙNG: 1 user bắn 50 request đồng thời cho cùng 1 item -> đúng 1 đơn thành công")
    void duplicatePurchasePrevention_50ConcurrentRequestsSameUser() throws Exception {
        UserJpaEntity buyer = userJpaRepository.save(UserJpaEntity.builder()
                .username("dupBuyerUser1")
                .email("dup-buyer1@flashmart.com")
                .password("hashed")
                .role(Role.USER)
                .build());

        Product product = createProductUseCase.execute(
                new CreateProductCommand("iPad Pro", "M4", BigDecimal.valueOf(25000000), 100));
        Campaign campaign = createCampaignUseCase.execute(new CreateCampaignUseCase.Command(
                "Dup Test Campaign", LocalDateTime.now().minusMinutes(5), LocalDateTime.now().plusHours(1)));
        CampaignItem item = addCampaignItemUseCase.execute(new AddCampaignItemUseCase.Command(
                campaign.getId(), product.getId(), BigDecimal.valueOf(19000000), 20));
        updateCampaignStatusUseCase.execute(campaign.getId(), CampaignStatus.ACTIVE);

        int threads = 50;
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        CountDownLatch ready = new CountDownLatch(threads);
        CountDownLatch start = new CountDownLatch(1);
        AtomicInteger successCount = new AtomicInteger();
        AtomicInteger duplicateRejectedCount = new AtomicInteger();

        List<Future<?>> futures = new ArrayList<>();
        for (int i = 0; i < threads; i++) {
            futures.add(pool.submit(() -> {
                ready.countDown();
                try {
                    start.await();
                    placeOrderUseCase.execute(buyer.getId(), item.getId());
                    successCount.incrementAndGet();
                } catch (ConflictException ex) {
                    if ("ORD-002".equals(ex.getErrorCode())) {
                        duplicateRejectedCount.incrementAndGet();
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }));
        }

        ready.await(5, TimeUnit.SECONDS);
        start.countDown();
        for (Future<?> f : futures) {
            f.get(15, TimeUnit.SECONDS);
        }
        pool.shutdown();

        assertEquals(1, successCount.get(), "Chỉ đúng 1 request được phép thành công");
        assertEquals(49, duplicateRejectedCount.get(), "49 request còn lại phải bị chặn với mã ORD-002");

        await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> {
            CampaignItem reloaded = campaignItemRepository.findById(item.getId()).orElseThrow();
            assertEquals(19, reloaded.getAvailableQuantity());
            assertEquals(19L, inventoryPort.getStock(item.getId()));
            assertTrue(orderJpaRepository.findByUserIdAndCampaignItemId(buyer.getId(), item.getId()).isPresent());
        });
    }

    @Test
    @DisplayName("CHỐNG OVERSELL: tồn kho 100, 1000 request đồng thời từ 1000 user khác nhau -> đúng 100 đơn, tồn kho = 0, không âm, Redis & DB khớp nhau")
    void antiOversell_stock100_1000ConcurrentRequestsFromDifferentUsers() throws Exception {
        int totalRequests = 1000;
        int initialStock = 100;

        // Batch-insert 1000 distinct users quickly via JDBC
        List<Long> userIds = new ArrayList<>(totalRequests);
        for (int i = 0; i < totalRequests; i++) {
            Long id = jdbcTemplate.queryForObject(
                    "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, 'hash', 'USER') RETURNING id",
                    Long.class,
                    "conc_user_" + i,
                    "conc_" + i + "@flashmart.com"
            );
            userIds.add(id);
        }

        Product product = createProductUseCase.execute(
                new CreateProductCommand("PS5 Pro", "Console", BigDecimal.valueOf(20000000), 500));
        Campaign campaign = createCampaignUseCase.execute(new CreateCampaignUseCase.Command(
                "Oversell Test Campaign", LocalDateTime.now().minusMinutes(5), LocalDateTime.now().plusHours(1)));
        CampaignItem item = addCampaignItemUseCase.execute(new AddCampaignItemUseCase.Command(
                campaign.getId(), product.getId(), BigDecimal.valueOf(12000000), initialStock));
        updateCampaignStatusUseCase.execute(campaign.getId(), CampaignStatus.ACTIVE);

        ExecutorService pool = Executors.newFixedThreadPool(64);
        CountDownLatch ready = new CountDownLatch(totalRequests);
        CountDownLatch start = new CountDownLatch(1);
        AtomicInteger acceptedCount = new AtomicInteger();
        AtomicInteger outOfStockCount = new AtomicInteger();
        AtomicInteger otherErrors = new AtomicInteger();

        List<Future<?>> futures = new ArrayList<>(totalRequests);
        for (Long uid : userIds) {
            futures.add(pool.submit(() -> {
                ready.countDown();
                try {
                    start.await();
                    placeOrderUseCase.execute(uid, item.getId());
                    acceptedCount.incrementAndGet();
                } catch (ConflictException ex) {
                    if ("ORD-001".equals(ex.getErrorCode())) {
                        outOfStockCount.incrementAndGet();
                    } else {
                        otherErrors.incrementAndGet();
                    }
                } catch (Exception e) {
                    otherErrors.incrementAndGet();
                }
            }));
        }

        ready.await(10, TimeUnit.SECONDS);
        start.countDown();
        for (Future<?> f : futures) {
            f.get(30, TimeUnit.SECONDS);
        }
        pool.shutdown();

        assertEquals(0, otherErrors.get(), "Không được có lỗi ngoài dự kiến");
        assertEquals(initialStock, acceptedCount.get(), "Đúng 100 đơn được chấp nhận");
        assertEquals(totalRequests - initialStock, outOfStockCount.get(), "Đúng 900 request bị từ chối vì hết hàng");
        assertEquals(0L, inventoryPort.getStock(item.getId()), "Tồn kho Redis phải bằng 0 (không âm)");

        await().atMost(Duration.ofSeconds(20)).untilAsserted(() -> {
            CampaignItem dbItem = campaignItemRepository.findById(item.getId()).orElseThrow();
            Integer dbStock = dbItem.getAvailableQuantity();
            Long confirmedOrders = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM orders WHERE campaign_item_id = ? AND status = 'CONFIRMED'",
                    Long.class,
                    item.getId()
            );
            assertEquals(0, dbStock, "available_quantity trong DB phải = 0 và không âm");
            assertEquals(100L, confirmedOrders, "Trong DB phải có đúng 100 đơn CONFIRMED");
            assertEquals(dbStock.longValue(), inventoryPort.getStock(item.getId()), "Redis và DB phải khớp nhau");
        });
    }
}
