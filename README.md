# Danh Mục Cá Nhân (Portfolio v2) — Tuan Dang

Trang portfolio cá nhân phong cách **"Research Notebook"** (Sổ tay nghiên cứu kỹ thuật / Swiss Grid), tối giản, hiện đại và tập trung vào nội dung. Toàn bộ mã nguồn và tài nguyên nằm trực tiếp tại thư mục gốc của repository.

- **Framework**: Astro 7.x (Static Site Generation)
- **Đa ngôn ngữ (i18n)**: Tiếng Việt (`/`) & Tiếng Anh (`/en/`), nút chuyển đổi ngôn ngữ trên Header với khả năng lưu giữ anchor hash (`#projects`, `#skills`,...)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite` với biến `@theme` và `@custom-variant dark` trong CSS)
- **Typography**: Self-hosted fonts qua Fontsource (`@fontsource-variable/space-grotesk` và `@fontsource/jetbrains-mono`)
- **Theme**: Chế độ Sáng (Warm Paper `#F4F1EA`) mặc định & Tối (Deep Ink `#121211`), điểm nhấn Signal Orange (`#FF4F00`). Không bị giật flash khi tải trang.
- **Tiêu chuẩn**: Không phụ thuộc thư viện UI nặng, chuẩn WCAG AA, responsive hoàn hảo từ 320px đến 1440px+.
- **Live Demos**: 3 trang demo trực tiếp tích hợp sẵn (`/demos/coffee/`, `/demos/architecture/`, `/demos/agency/`).

---

## 1. Cài đặt và Chạy cục bộ

Yêu cầu: Node.js v20+ (khuyến nghị v24) và npm.

```bash
# Cài đặt các gói phụ thuộc
npm install

# Khởi động môi trường phát triển (Dev server)
npm run dev

# Kiểm tra kiểu dữ liệu và build phiên bản xuất bản (Production)
npm run build

# Xem thử kết quả build tĩnh
npm run preview
```

---

## 2. Nơi chỉnh sửa nội dung

Tất cả thông tin cá nhân, dự án, kỹ năng, mạng xã hội và nhãn giao diện cho cả 2 ngôn ngữ (VI & EN) được tập trung tại một nơi duy nhất:
👉 **`src/data/profile.ts`**

Các mục có thể chỉnh sửa:
- `profileVI`: Nội dung hiển thị Tiếng Việt.
- `profileEN`: Nội dung hiển thị Tiếng Anh.
- Bao gồm: `tagline`, `bio`, `currently`, `location`, `education`, `skills`, `projects`, `socials`, và `ui` labels.

---

## 3. Hướng dẫn Triển khai lên Vercel

Dự án đã có sẵn cấu hình bảo mật `vercel.json` (CSP, HSTS, X-Content-Type-Options, Cache Control) tại thư mục gốc.

Khi kết nối repository với Vercel:
1. **Framework Preset**: Chọn `Astro`.
2. **Root Directory**: Để mặc định (`./`).
3. **Build Command**: `npm run build` (hoặc để mặc định theo Astro).
4. **Output Directory**: `dist` (mặc định của Astro).
5. Nhấn **Deploy**.
