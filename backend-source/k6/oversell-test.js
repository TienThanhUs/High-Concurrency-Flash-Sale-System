import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

/**
 * KỊCH BẢN 1 — KIỂM THỬ CHỐNG BÁN LỐ (ANTI-OVERSELL) QUA HTTP THẬT
 * - Tạo 1 mặt hàng Flash Sale có tồn kho = 100 (INITIAL_STOCK)
 * - Tạo 300 người dùng khác nhau (TOTAL_USERS), mỗi người giữ 1 JWT riêng
 * - Kích hoạt đồng loạt 300 VUs bắn POST /api/v1/orders cùng lúc
 * - Kỳ vọng: Đúng 100 đơn nhận 202 Accepted, đúng 200 request nhận 409 Conflict (ORD-001)
 */

const acceptedOrders = new Counter('flashmart_accepted_202');
const outOfStockOrders = new Counter('flashmart_out_of_stock_409');
const unexpectedResponses = new Counter('flashmart_unexpected_status');

const TOTAL_USERS = Number(__ENV.TOTAL_USERS || 300);
const INITIAL_STOCK = Number(__ENV.INITIAL_STOCK || 100);
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || 'admin@flashmart.com';
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || 'Admin@123456';

export const options = {
  scenarios: {
    flash_sale_rush: {
      executor: 'per-vu-iterations',
      vus: TOTAL_USERS,
      iterations: 1,
      maxDuration: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    flashmart_accepted_202: [`count==${INITIAL_STOCK}`],
    flashmart_out_of_stock_409: [`count==${TOTAL_USERS - INITIAL_STOCK}`],
    flashmart_unexpected_status: ['count==0'],
  },
};

export function setup() {
  const jsonHeaders = { 'Content-Type': 'application/json' };

  // 1. Đăng nhập hoặc đăng ký tài khoản ADMIN
  let loginRes = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    { headers: jsonHeaders }
  );

  if (loginRes.status !== 200) {
    throw new Error(
      `Không thể đăng nhập ADMIN (${ADMIN_EMAIL}). Hãy chắc chắn app đã bật với ADMIN_PASSWORD=${ADMIN_PASSWORD}. Status=${loginRes.status}, Body=${loginRes.body}`
    );
  }

  const adminJwt = loginRes.json('jwt');
  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminJwt}`,
  };

  // 2. Tạo Product mới cho đợt test
  const runId = Date.now();
  const prodRes = http.post(
    `${BASE_URL}/api/v1/products`,
    JSON.stringify({
      name: `PS5 Pro FlashSale k6-${runId}`,
      description: 'San pham test chong oversell bang k6',
      originalPrice: 20000000,
      generalStock: 1000,
    }),
    { headers: adminHeaders }
  );
  if (prodRes.status !== 201) {
    throw new Error(`Tạo Product thất bại: ${prodRes.status} - ${prodRes.body}`);
  }
  const productId = prodRes.json('id');

  // 3. Tạo Campaign (bắt đầu từ 5 phút trước, kết thúc sau 1 giờ)
  const now = new Date();
  const startTime = new Date(now.getTime() - 5 * 60000).toISOString().slice(0, 19);
  const endTime = new Date(now.getTime() + 60 * 60000).toISOString().slice(0, 19);
  const campRes = http.post(
    `${BASE_URL}/api/v1/campaigns`,
    JSON.stringify({
      name: `Campaign Oversell k6-${runId}`,
      startTime: startTime,
      endTime: endTime,
    }),
    { headers: adminHeaders }
  );
  if (campRes.status !== 201) {
    throw new Error(`Tạo Campaign thất bại: ${campRes.status} - ${campRes.body}`);
  }
  const campaignId = campRes.json('id');

  // 4. Thêm Item vào Campaign với totalQuantity = INITIAL_STOCK (100)
  const itemRes = http.post(
    `${BASE_URL}/api/v1/campaigns/${campaignId}/items`,
    JSON.stringify({
      productId: productId,
      flashSalePrice: 12000000,
      totalQuantity: INITIAL_STOCK,
    }),
    { headers: adminHeaders }
  );
  if (itemRes.status !== 201) {
    throw new Error(`Thêm CampaignItem thất bại: ${itemRes.status} - ${itemRes.body}`);
  }
  const campaignItemId = itemRes.json('id');

  // 5. Kích hoạt Campaign sang ACTIVE (warm-up tồn kho lên Redis)
  const statusRes = http.patch(
    `${BASE_URL}/api/v1/campaigns/${campaignId}/status`,
    JSON.stringify({ status: 'ACTIVE' }),
    { headers: adminHeaders }
  );
  if (statusRes.status !== 200) {
    throw new Error(`Kích hoạt Campaign thất bại: ${statusRes.status} - ${statusRes.body}`);
  }

  // 6. Đăng ký sẵn TOTAL_USERS tài khoản người mua và thu thập JWT
  const buyerTokens = [];
  for (let i = 0; i < TOTAL_USERS; i++) {
    const regRes = http.post(
      `${BASE_URL}/api/v1/auth/register`,
      JSON.stringify({
        username: `k6buyer_${runId}_${i}`,
        email: `k6buyer_${runId}_${i}@flashmart.com`,
        password: 'password123',
      }),
      { headers: jsonHeaders }
    );
    if (regRes.status !== 200) {
      throw new Error(`Đăng ký buyer thứ ${i} thất bại: ${regRes.status} - ${regRes.body}`);
    }
    buyerTokens.push(regRes.json('jwt'));
  }

  return { campaignItemId, buyerTokens };
}

export default function (data) {
  const myJwt = data.buyerTokens[__VU - 1];

  const res = http.post(
    `${BASE_URL}/api/v1/orders`,
    JSON.stringify({ campaignItemId: data.campaignItemId }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${myJwt}`,
      },
    }
  );

  if (res.status === 202) {
    acceptedOrders.add(1);
  } else if (res.status === 409 && res.json('errorCode') === 'ORD-001') {
    outOfStockOrders.add(1);
  } else {
    unexpectedResponses.add(1);
  }

  check(res, {
    'status is 202 (Accepted) or 409 (ORD-001 Out of stock)': (r) =>
      r.status === 202 || (r.status === 409 && r.json('errorCode') === 'ORD-001'),
  });
}
