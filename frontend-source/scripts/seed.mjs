#!/usr/bin/env node

/**
 * FlashMart - Data Seed Script (Node.js ESM)
 * Nạp dữ liệu mẫu gồm 12 sản phẩm công nghệ/pixel, tạo 1 chiến dịch Flash Sale ACTIVE,
 * gán 6 sản phẩm và đồng bộ kho Redis qua endpoint reconcile.
 *
 * Chạy: node scripts/seed.mjs
 */

const API_URL = process.env.API_URL || 'http://localhost:8080/api/v1';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@flashmart.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123456';

// 12 sản phẩm mẫu tiếng Việt hợp chủ đề pixel/game/công nghệ
const SEED_PRODUCTS = [
  {
    name: 'Bàn phím cơ Pixel Retro Switch Blue',
    description: 'Bàn phím cơ switch xanh đậm chất 8-bit, keycap vuông sắc nét, gõ nảy tay.',
    originalPrice: 1250000,
    generalStock: 60,
  },
  {
    name: 'Bàn phím không dây Minecraft Block',
    description: 'Bàn phím họa tiết pixel cỏ đất phong cách khối vuông, kết nối đa thiết bị.',
    originalPrice: 890000,
    generalStock: 50,
  },
  {
    name: 'Chuột Gaming 8-Bit Pixel Speed',
    description: 'Chuột gaming cảm biến quang học 12.000 DPI, trọng lượng siêu nhẹ 65g.',
    originalPrice: 450000,
    generalStock: 80,
  },
  {
    name: 'Chuột không dây Silent Pixel Pocket',
    description: 'Chuột tĩnh âm click êm ái, thiết kế góc cạnh vuông vắn nhỏ gọn bỏ túi.',
    originalPrice: 280000,
    generalStock: 90,
  },
  {
    name: 'Tai nghe chụp tai Pixel Surround 7.1',
    description: 'Tai nghe gaming chụp tai tái tạo âm thanh retro 8-bit và chiptune sống động.',
    originalPrice: 1650000,
    generalStock: 35,
  },
  {
    name: 'Tai nghe nhét tai Chiptune Earbuds',
    description: 'Tai nghe earphone chất âm chi tiết, dây dệt chống rối phong cách game thùng.',
    originalPrice: 320000,
    generalStock: 100,
  },
  {
    name: 'Tay cầm chơi game Retro Arcade Gamepad',
    description: 'Tay cầm 8 nút layout cổ điển hỗ trợ kết nối Bluetooth cho PC và điện thoại.',
    originalPrice: 680000,
    generalStock: 55,
  },
  {
    name: 'Tay cầm không dây Pro Controller Pixel',
    description: 'Tay cầm công thái học hỗ trợ rung kép, con quay hồi chuyển 6 trục nhạy bén.',
    originalPrice: 1200000,
    generalStock: 45,
  },
  {
    name: 'Thẻ nhớ MicroSD Pixel Speed 128GB',
    description: 'Thẻ nhớ tốc độ đọc 160MB/s chuẩn U3 V30, tối ưu cài game và video 4K.',
    originalPrice: 180000,
    generalStock: 100,
  },
  {
    name: 'Thẻ nhớ Extreme Pro 256GB Gaming',
    description: 'Thẻ nhớ dung lượng khủng mở rộng bộ nhớ máy chơi game cầm tay tiện lợi.',
    originalPrice: 390000,
    generalStock: 70,
  },
  {
    name: 'Đế sạc nhanh không dây Pixel Pad 30W',
    description: 'Đế sạc phát sáng pixel art báo trạng thái sạc pin thông minh, chuẩn Qi2.',
    originalPrice: 290000,
    generalStock: 85,
  },
  {
    name: 'Củ sạc GaN Pixel Power 65W 3 Cổng',
    description: 'Củ sạc công nghệ GaN siêu nhỏ gọn 2 Type-C 1 Type-A sạc nhanh laptop, phone.',
    originalPrice: 520000,
    generalStock: 65,
  },
];

// Chuyển thời gian sang chuỗi giờ Việt Nam (UTC+7) định dạng yyyy-MM-ddTHH:mm:ss
function formatVietnamTime(date) {
  // Tính offset +7 tiếng từ UTC
  const vnOffset = 7 * 60; // phút
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const vnDate = new Date(utc + vnOffset * 60000);

  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = vnDate.getFullYear();
  const MM = pad(vnDate.getMonth() + 1);
  const dd = pad(vnDate.getDate());
  const hh = pad(vnDate.getHours());
  const mm = pad(vnDate.getMinutes());
  const ss = pad(vnDate.getSeconds());

  return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}`;
}

async function main() {
  console.log('==================================================================');
  console.log('⚡ FLASHMART - BẮT ĐẦU NẠP DỮ LIỆU MẪU (SEED DATA SCRIPT) ⚡');
  console.log(`📡 Kết nối Backend API: ${API_URL}`);
  console.log(`👤 Tài khoản Quản trị: ${ADMIN_EMAIL}`);
  console.log('==================================================================\n');

  // 1. Đăng nhập ADMIN để lấy JWT token
  let adminJwt = '';
  try {
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });

    if (!loginRes.ok) {
      const errBody = await loginRes.text();
      console.error(`❌ Đăng nhập ADMIN thất bại! Status: ${loginRes.status}`);
      console.error(`Chi tiết lỗi: ${errBody}`);
      console.error('\n👉 Hướng dẫn khắc phục:');
      console.error('1. Đảm bảo backend đã khởi động với biến môi trường AdminSeeder:');
      console.error(
        `   ADMIN_USERNAME=admin ADMIN_EMAIL=${ADMIN_EMAIL} ADMIN_PASSWORD=${ADMIN_PASSWORD} ./mvnw spring-boot:run`
      );
      console.error('2. Hoặc kiểm tra xem cổng 8080 của backend có đang lắng nghe không.\n');
      process.exit(1);
    }

    const authData = await loginRes.json();
    adminJwt = authData.jwt;
    console.log('✔ Đăng nhập ADMIN thành công! Đã nhận JWT token.');
  } catch (err) {
    console.error(`❌ Không thể kết nối tới ${API_URL}. Backend đã chạy chưa?`);
    console.error(`Lỗi: ${err.message}\n`);
    process.exit(1);
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminJwt}`,
  };

  // 2. Lấy danh sách sản phẩm hiện tại trong kho để tránh tạo trùng (Idempotent)
  console.log('\n📦 Đang kiểm tra danh mục sản phẩm...');
  const currentProdsRes = await fetch(`${API_URL}/products?page=0&size=100`, {
    headers: authHeaders,
  });
  const currentProdsData = await currentProdsRes.json();
  const existingProducts = currentProdsData.items || [];
  const existingNameMap = new Map(existingProducts.map((p) => [p.name.trim().toLowerCase(), p]));

  const allReadyProducts = [];
  let createdCount = 0;

  for (const item of SEED_PRODUCTS) {
    const lowerName = item.name.trim().toLowerCase();
    if (existingNameMap.has(lowerName)) {
      console.log(`  - [ĐÃ CÓ] ${item.name}`);
      allReadyProducts.push(existingNameMap.get(lowerName));
    } else {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminJwt}`,
        },
        body: JSON.stringify(item),
      });

      if (res.ok) {
        const created = await res.json();
        console.log(`  + [TẠO MỚI] ${created.name} (${created.originalPrice.toLocaleString('vi-VN')} đ)`);
        allReadyProducts.push(created);
        createdCount++;
      } else {
        const errText = await res.text();
        console.warn(`  ! Không thể tạo ${item.name}: ${errText}`);
      }
    }
  }
  console.log(`✔ Đã sẵn sàng ${allReadyProducts.length} sản phẩm (Tạo mới: ${createdCount}, Có sẵn: ${existingProducts.length}).`);

  // 3. Tạo hoặc kiểm tra chiến dịch "Flash Sale Giờ Vàng"
  console.log('\n🔥 Đang kiểm tra chiến dịch Flash Sale...');
  const activeCampRes = await fetch(`${API_URL}/campaigns/active`, {
    headers: authHeaders,
  });
  const activeCampaigns = (await activeCampRes.json()) || [];
  let campaign = activeCampaigns.find((c) => c.name.includes('Flash Sale Giờ Vàng'));

  const now = new Date();
  // Bắt đầu từ 2 phút trước để chiến dịch mở ngay lập tức mà không bị "chưa mở"
  const startTime = formatVietnamTime(new Date(now.getTime() - 2 * 60000));
  // Kết thúc sau 3 giờ
  const endTime = formatVietnamTime(new Date(now.getTime() + 3 * 3600000));

  if (campaign) {
    console.log(`  - Chiến dịch "Flash Sale Giờ Vàng" đã tồn tại (ID: ${campaign.id}, Status: ${campaign.status}).`);
  } else {
    console.log(`  + Tạo mới chiến dịch: "Flash Sale Giờ Vàng"`);
    console.log(`    Bắt đầu: ${startTime} (Giờ VN)`);
    console.log(`    Kết thúc: ${endTime} (Giờ VN)`);

    const createCampRes = await fetch(`${API_URL}/campaigns`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Flash Sale Giờ Vàng',
        startTime: startTime,
        endTime: endTime,
      }),
    });

    if (!createCampRes.ok) {
      const err = await createCampRes.text();
      console.error(`❌ Tạo chiến dịch thất bại: ${err}`);
      process.exit(1);
    }

    campaign = await createCampRes.json();
    console.log(`✔ Đã tạo chiến dịch (ID: ${campaign.id}).`);
  }

  // 4. Thêm 6 sản phẩm vào chiến dịch (giảm giá 30% - 70%, số lượng 5 - 30)
  console.log('\n🎯 Đang gán 6 sản phẩm vào chiến dịch Flash Sale...');
  const existingItemProductIds = new Set((campaign.items || []).map((i) => i.productId));
  const candidateProducts = allReadyProducts.slice(0, 6);

  // Mức giảm giá mẫu cho 6 sản phẩm (30% đến 70%)
  const discountRates = [0.5, 0.4, 0.6, 0.35, 0.7, 0.45];
  const quantities = [20, 15, 30, 25, 10, 15];

  let addedItemsCount = 0;

  for (let i = 0; i < candidateProducts.length; i++) {
    const prod = candidateProducts[i];
    if (existingItemProductIds.has(prod.id)) {
      console.log(`  - [ĐÃ GÁN] ${prod.name}`);
      continue;
    }

    const discountRate = discountRates[i] || 0.5;
    const salePrice = Math.round((prod.originalPrice * (1 - discountRate)) / 1000) * 1000;
    const totalQty = quantities[i] || 20;

    const addItemRes = await fetch(`${API_URL}/campaigns/${campaign.id}/items`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        productId: prod.id,
        flashSalePrice: salePrice,
        totalQuantity: totalQty,
      }),
    });

    if (addItemRes.ok) {
      console.log(
        `  + [GÁN SALE] ${prod.name} | Gốc: ${prod.originalPrice.toLocaleString('vi-VN')} đ ➜ Sale: ${salePrice.toLocaleString('vi-VN')} đ (-${Math.round(discountRate * 100)}%) | Số lượng: ${totalQty}`
      );
      addedItemsCount++;
    } else {
      const err = await addItemRes.text();
      console.warn(`  ! Không thể gán ${prod.name}: ${err}`);
    }
  }

  // 5. Đổi trạng thái chiến dịch sang ACTIVE nếu chưa ACTIVE
  if (campaign.status !== 'ACTIVE') {
    console.log('\n🟢 Đang kích hoạt trạng thái chiến dịch sang ACTIVE...');
    const updateRes = await fetch(`${API_URL}/campaigns/${campaign.id}/status`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status: 'ACTIVE' }),
    });

    if (updateRes.ok) {
      console.log('✔ Đã kích hoạt chiến dịch sang ACTIVE thành công!');
    } else {
      console.warn(`! Không thể đổi trạng thái chiến dịch: ${await updateRes.text()}`);
    }
  } else {
    console.log('\n✔ Chiến dịch đã ở trạng thái ACTIVE.');
  }

  // 6. Gọi POST /campaigns/reconcile để đồng bộ kho sang Redis
  console.log('\n🔄 Đang gọi POST /campaigns/reconcile để đồng bộ kho CSDL sang Redis...');
  const reconcileRes = await fetch(`${API_URL}/campaigns/reconcile`, {
    method: 'POST',
    headers: authHeaders,
  });

  if (reconcileRes.ok) {
    const recData = await reconcileRes.json();
    console.log(`✔ Đồng bộ kho Redis hoàn tất! Số item đã reconcile: ${recData.reconciledItems}`);
  } else {
    console.warn(`! Lỗi gọi reconcile: ${await reconcileRes.text()}`);
  }

  // Tóm tắt kết quả
  console.log('\n==================================================================');
  console.log('🎉 TỔNG KẾT NẠP DỮ LIỆU MẪU THÀNH CÔNG! 🎉');
  console.log(`• Tổng số sản phẩm trong kho: ${allReadyProducts.length}`);
  console.log(`• Chiến dịch: "Flash Sale Giờ Vàng" (ACTIVE, kết thúc sau 3 giờ)`);
  console.log(`• Số mặt hàng Flash Sale: ${(campaign.items?.length || 0) + addedItemsCount} sản phẩm`);
  console.log('👉 Bây giờ bạn có thể mở http://localhost:5173 để thấy Flash Sale và bấm "SĂN NGAY"!');
  console.log('==================================================================\n');
}

main().catch((err) => {
  console.error('Lỗi ngoài dự kiến:', err);
  process.exit(1);
});
