import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

/**
 * KỊCH BẢN 2 — KIỂM THỬ CHỐNG MUA TRÙNG (ANTI-DUPLICATE PURCHASE) QUA HTTP THẬT
 * - Tạo 1 mặt hàng Flash Sale có tồn kho = 20
 * - Tạo 1 người mua duy nhất (1 JWT token)
 * - Dùng 50 VUs bắn đồng loạt 50 HTTP requests cùng lúc bằng chính JWT của người đó
 * - Kỳ vọng: Đúng 1 request nhận 202 Accepted, đúng 49 requests bị chặn 409 Conflict (ORD-002)
 */

const acceptedOrders = new Counter('flashmart_accepted_202');
const duplicateRejected = new Counter('flashmart_duplicate_409');
const unexpectedResponses = new Counter('flashmart_unexpected_status');

const CONCURRENT_REQUESTS = Number(__ENV.CONCURRENT_REQUESTS || 50);
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || 'admin@flashmart.com';
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || 'Admin@123456';

export const options = {
  scenarios: {
    duplicate_purchase_spam: {
      executor: 'per-vu-iterations',
      vus: CONCURRENT_REQUESTS,
      iterations: 1,
      maxDuration: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    flashmart_accepted_202: ['count==1'],
    flashmart_duplicate_409: [`count==${CONCURRENT_REQUESTS - 1}`],
    flashmart_unexpected_status: ['count==0'],
  },
};

export function setup() {
  const jsonHeaders = { 'Content-Type': 'application/json' };

  const loginRes = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    { headers: jsonHeaders }
  );
  if (loginRes.status !== 200) {
    throw new Error(
      `Không thể đăng nhập ADMIN (${ADMIN_EMAIL}). Hãy chắc chắn app đã bật với ADMIN_PASSWORD=${ADMIN_PASSWORD}. Status=${loginRes.status}`
    );
  }

  const adminJwt = loginRes.json('jwt');
  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminJwt}`,
  };

  const runId = Date.now();
  const prodRes = http.post(
    `${BASE_URL}/api/v1/products`,
    JSON.stringify({
      name: `iPad Pro M4 k6-dup-${runId}`,
      description: 'San pham test chong mua trung bang k6',
      originalPrice: 25000000,
      generalStock: 100,
    }),
    { headers: adminHeaders }
  );
  const productId = prodRes.json('id');

  const now = new Date();
  const startTime = new Date(now.getTime() - 5 * 60000).toISOString().slice(0, 19);
  const endTime = new Date(now.getTime() + 60 * 60000).toISOString().slice(0, 19);
  const campRes = http.post(
    `${BASE_URL}/api/v1/campaigns`,
    JSON.stringify({
      name: `Campaign Duplicate k6-${runId}`,
      startTime: startTime,
      endTime: endTime,
    }),
    { headers: adminHeaders }
  );
  const campaignId = campRes.json('id');

  const itemRes = http.post(
    `${BASE_URL}/api/v1/campaigns/${campaignId}/items`,
    JSON.stringify({
      productId: productId,
      flashSalePrice: 19000000,
      totalQuantity: 20,
    }),
    { headers: adminHeaders }
  );
  const campaignItemId = itemRes.json('id');

  http.patch(
    `${BASE_URL}/api/v1/campaigns/${campaignId}/status`,
    JSON.stringify({ status: 'ACTIVE' }),
    { headers: adminHeaders }
  );

  // Đăng ký 1 tài khoản buyer duy nhất
  const regRes = http.post(
    `${BASE_URL}/api/v1/auth/register`,
    JSON.stringify({
      username: `k6dupbuyer_${runId}`,
      email: `k6dupbuyer_${runId}@flashmart.com`,
      password: 'password123',
    }),
    { headers: jsonHeaders }
  );
  const buyerJwt = regRes.json('jwt');

  return { campaignItemId, buyerJwt };
}

export default function (data) {
  const res = http.post(
    `${BASE_URL}/api/v1/orders`,
    JSON.stringify({ campaignItemId: data.campaignItemId }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.buyerJwt}`,
      },
    }
  );

  if (res.status === 202) {
    acceptedOrders.add(1);
  } else if (res.status === 409 && res.json('errorCode') === 'ORD-002') {
    duplicateRejected.add(1);
  } else {
    unexpectedResponses.add(1);
  }

  check(res, {
    'status is 202 (Accepted) or 409 (ORD-002 Already purchased)': (r) =>
      r.status === 202 || (r.status === 409 && r.json('errorCode') === 'ORD-002'),
  });
}
