package com.hcmus.FlashMart_API.infrastructure.redis;

import com.hcmus.FlashMart_API.domain.repository.FlashSaleInventoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RedisFlashSaleInventoryAdapter implements FlashSaleInventoryPort {

    private static final String STOCK_KEY_PREFIX = "flashmart:stock:";
    private static final String BUYERS_KEY_PREFIX = "flashmart:buyers:";
    private static final Duration DEFAULT_TTL = Duration.ofDays(7);

    /**
     * Atomic Lua script:
     * KEYS[1] = stock key, KEYS[2] = buyers set key, ARGV[1] = userId
     * Return codes:
     *   1  = OK (decremented stock & added user to buyers set)
     *   0  = OUT_OF_STOCK
     *   2  = ALREADY_PURCHASED
     *  -1  = STOCK_NOT_INITIALIZED
     */
    private static final DefaultRedisScript<Long> RESERVE_SCRIPT;
    private static final DefaultRedisScript<Long> RELEASE_SCRIPT;

    static {
        RESERVE_SCRIPT = new DefaultRedisScript<>();
        RESERVE_SCRIPT.setResultType(Long.class);
        RESERVE_SCRIPT.setScriptText("""
                if redis.call('SISMEMBER', KEYS[2], ARGV[1]) == 1 then
                    return 2
                end
                local stock = redis.call('GET', KEYS[1])
                if not stock then
                    return -1
                end
                if tonumber(stock) <= 0 then
                    return 0
                end
                redis.call('DECR', KEYS[1])
                redis.call('SADD', KEYS[2], ARGV[1])
                return 1
                """);

        RELEASE_SCRIPT = new DefaultRedisScript<>();
        RELEASE_SCRIPT.setResultType(Long.class);
        RELEASE_SCRIPT.setScriptText("""
                local removed = redis.call('SREM', KEYS[2], ARGV[1])
                if removed == 1 then
                    redis.call('INCR', KEYS[1])
                    return 1
                end
                return 0
                """);
    }

    private final StringRedisTemplate redisTemplate;

    public static String stockKey(UUID campaignItemId) {
        return STOCK_KEY_PREFIX + campaignItemId;
    }

    public static String buyersKey(UUID campaignItemId) {
        return BUYERS_KEY_PREFIX + campaignItemId;
    }

    @Override
    public void warmUpItem(UUID campaignItemId, int availableQuantity, Set<Long> purchasedUserIds) {
        String sKey = stockKey(campaignItemId);
        String bKey = buyersKey(campaignItemId);
        redisTemplate.opsForValue().set(sKey, String.valueOf(Math.max(0, availableQuantity)), DEFAULT_TTL);
        redisTemplate.delete(bKey);
        if (purchasedUserIds != null && !purchasedUserIds.isEmpty()) {
            String[] members = purchasedUserIds.stream().map(String::valueOf).toArray(String[]::new);
            redisTemplate.opsForSet().add(bKey, members);
            redisTemplate.expire(bKey, DEFAULT_TTL);
        }
    }

    @Override
    public ReservationStatus tryReserve(UUID campaignItemId, Long userId) {
        Long code = redisTemplate.execute(
                RESERVE_SCRIPT,
                List.of(stockKey(campaignItemId), buyersKey(campaignItemId)),
                String.valueOf(userId)
        );
        if (code == null || code == -1L) {
            return ReservationStatus.STOCK_NOT_INITIALIZED;
        }
        if (code == 1L) {
            return ReservationStatus.OK;
        }
        if (code == 2L) {
            return ReservationStatus.ALREADY_PURCHASED;
        }
        return ReservationStatus.OUT_OF_STOCK;
    }

    @Override
    public void releaseReservation(UUID campaignItemId, Long userId) {
        redisTemplate.execute(
                RELEASE_SCRIPT,
                List.of(stockKey(campaignItemId), buyersKey(campaignItemId)),
                String.valueOf(userId)
        );
    }

    @Override
    public Long getStock(UUID campaignItemId) {
        String val = redisTemplate.opsForValue().get(stockKey(campaignItemId));
        return val != null ? Long.parseLong(val) : null;
    }
}
