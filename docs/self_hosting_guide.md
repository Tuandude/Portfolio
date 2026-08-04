# Hướng dẫn Tự Triển khai (Self-Host) Aider Bot cho Repository của riêng bạn

Tài liệu này hướng dẫn cách đưa Aider Bot về chạy riêng cho các dự án/repository khác của bạn hoặc đội ngũ của bạn.

---

## Các thành phần cần chuẩn bị
Để chạy Aider Bot, bạn cần:
1. **Gemini API Key**: Dùng để phân tích code diff và sinh sơ đồ/tóm tắt (Lấy tại [Google AI Studio](https://aistudio.google.com/)).
2. **GitHub Personal Access Token (PAT)**: Token có quyền `repo` để Bot có thể đọc diff và tự động ghi nhận xét (comment) lên Pull Request.
3. **Webhook Secret**: Một chuỗi ký tự tự chọn để bảo mật kết nối giữa GitHub và Backend Server của bạn.

---

## HƯỚNG DẪN CHI TIẾT CÁC BƯỚC

### Bước 1: Tạo GitHub Personal Access Token (PAT)
1. Truy cập [GitHub Token Settings (Classic)](https://github.com/settings/tokens).
2. Chọn **Generate new token (classic)**.
3. Đặt tên gợi nhớ (ví dụ: `aider-bot-token`).
4. Chọn phạm vi quyền (Scope): tích chọn mục **`repo`** (bao gồm toàn bộ quyền quản lý repository).
5. Cuộn xuống bấm **Generate token** và sao lưu Token này lại (dạng `ghp_...`).

---

### Bước 2: Triển khai Backend Server
Mã nguồn backend nằm trong thư mục `backend/` của repository này. Bạn có thể triển khai lên bất cứ đâu hỗ trợ Docker/Node.js (như Render, Fly.io, Heroku, VPS hoặc Google Cloud Run).

#### Cách triển khai nhanh lên Google Cloud Run:
1. Cài đặt và đăng nhập [Google Cloud SDK](https://cloud.google.com/sdk).
2. Chuyển vào thư mục `backend/` của dự án.
3. Chạy lệnh deploy:
   ```bash
   gcloud run deploy aider-backend --source . --region us-central1
   ```
4. Sau khi deploy xong, Cloud Run sẽ trả về một **Service URL** (ví dụ: `https://aider-backend-xxxxx.run.app`).

#### Cấu hình các biến môi trường (Environment Variables):
Bạn cần thiết lập các biến môi trường sau cho Server của mình:
- `GEMINI_API_KEY`: API Key lấy từ Google AI Studio.
- `GITHUB_TOKEN`: GitHub PAT bạn vừa tạo ở Bước 1.
- `WEBHOOK_SECRET`: Một mật khẩu tự chọn để xác thực webhook (ví dụ: `my-super-secret-123`).

*Lưu ý: Nếu sử dụng Cloud Run, bạn cần cấu hình cờ `--no-cpu-throttling` để giữ CPU luôn hoạt động cho các tác vụ ngầm (tránh bị Cloud Run tắt container trước khi AI phân tích xong). Chạy lệnh sau để thiết lập biến môi trường và tắt CPU throttling:*
```bash
gcloud run services update aider-backend \
  --update-env-vars GEMINI_API_KEY=YOUR_GEMINI_KEY,GITHUB_TOKEN=YOUR_GITHUB_TOKEN,WEBHOOK_SECRET=YOUR_SECRET \
  --no-cpu-throttling \
  --region us-central1
```

---

### Bước 3: Cấu hình Webhook trên GitHub Repository của bạn
1. Truy cập vào repository GitHub mà bạn muốn Bot hoạt động.
2. Đi tới **Settings** -> **Webhooks** -> Bấm **Add webhook**.
3. Cấu hình các trường như sau:
   - **Payload URL**: Nhập URL server của bạn kèm theo đường dẫn `/api/webhook/github` (ví dụ: `https://aider-backend-xxxxx.run.app/api/webhook/github`).
   - **Content type**: Chọn **`application/json`**.
   - **Secret**: Nhập đúng chuỗi `WEBHOOK_SECRET` bạn đã cấu hình ở Bước 2.
   - **Which events would you like to trigger this webhook?**:
     - Chọn **Let me select individual events**.
     - Tích chọn duy nhất mục **`Pull requests`**.
     - Bỏ tích các mục khác (như `Pushes`).
   - **Active**: Tích chọn hoạt động.
4. Bấm **Add webhook**.

---

## HOÀN TẤT & KIỂM TRA
Giờ đây mỗi khi có Pull Request mới được mở hoặc cập nhật trên repository của bạn:
1. GitHub sẽ gửi sự kiện Webhook sang Backend Server của bạn.
2. Server xác thực chữ ký bảo mật.
3. Server tải diff, gửi tới Gemini để phân tích.
4. Bot tự động bình luận sơ đồ Mermaid sống và nhận xét kiến trúc trực tiếp trên PR!
