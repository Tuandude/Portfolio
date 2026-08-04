# Hướng dẫn Đóng gói và Nộp Dự án Aider tham gia Cuộc thi Google AI Studio / Gemini API

Dự án **Aider - The Interactive Project Biographer** của bạn hiện đã rất hoàn chỉnh và có nhiều điểm sáng kỹ thuật rất được Ban giám khảo Google (và các cuộc thi AI Hackathon) ưa chuộng.

Dưới đây là tài liệu hướng dẫn cách chuẩn bị hồ sơ nộp bài thi để đạt điểm số cao nhất.

---

## 1. Hồ sơ cần chuẩn bị (Submission Checklist)

Thông thường, các cuộc thi của Google (hoặc qua Devpost) yêu cầu 3 thành phần chính:

### 🎥 A. Video Demo (Thời lượng 2 - 3 phút)
Đây là phần quan trọng nhất để thuyết phục Ban giám khảo. Kịch bản video gợi ý:
* **0:00 - 0:30 (Đặt vấn đề)**: Nêu nỗi đau của lập trình viên — code thay đổi liên tục nhưng tài liệu kiến trúc (README, sơ đồ hệ thống) luôn bị bỏ quên và lỗi thời.
* **0:30 - 1:15 (Demo CLI & Dashboard)**: Show cảnh gõ lệnh commit ở local -> Aider tự động phân tích -> README.md tự động được chèn sơ đồ Mermaid sống -> Web Dashboard cập nhật timeline kèm giọng đọc hài hước của Bác sĩ code.
* **1:15 - 2:00 (Demo GitHub PR Bot - Điểm nhấn)**: Mở một PR trên GitHub -> Nhận ngay comment đề xuất sơ đồ Mermaid và tóm tắt tự động từ Bot chỉ trong vài giây.
* **2:00 - 2:30 (Kiến trúc & Kết luận)**: Chiếu sơ đồ kiến trúc hệ thống, nhấn mạnh việc tối ưu hóa token và cơ chế tự động dự phòng (fallback) đáng tin cậy.

### 📝 B. Tài liệu Mô tả dự án (Pitch Text)
Bản mô tả chi tiết dự án (sử dụng mẫu ở Phần 2).

### 💻 C. Mã nguồn công khai (GitHub Repo)
* Repo phải sạch sẽ, có file [README.md](file:///c:/Users/OS/PROJECT1/README.md) giới thiệu và hướng dẫn cài đặt chạy thử rõ ràng.
* Nên đính kèm tệp [self_hosting_guide.md](file:///c:/Users/OS/PROJECT1/docs/self_hosting_guide.md) để chứng minh dự án có khả năng mở rộng và tự triển khai tốt.

---

## 2. Bản thảo Pitch nộp bài thi (Dùng để Copy-Paste)

Bạn có thể dịch sang Tiếng Anh hoặc sử dụng mẫu Tiếng Việt dưới đây để điền vào form nộp bài:

### **Tên Dự Án**: AIDER - The Interactive Project Biographer
### **Slogan**: Bringing System Architecture to Life with Gemini API.

#### **💡 Nguồn cảm hứng (Inspiration)**
Mỗi lập trình viên đều hiểu nỗi khổ của việc duy trì tài liệu dự án. Hệ thống phình to ra mỗi ngày, các tệp tin kết nối đan xen lẫn nhau, nhưng sơ đồ kiến trúc trong file README vẫn là sơ đồ từ... ngày đầu tiên lập dự án. Chúng tôi tạo ra **Aider** để biến tài liệu dự án thành một thực thể sống tự động cập nhật theo từng dòng code, giúp việc cập nhật kiến trúc trở nên dễ dàng và thú vị.

#### **🛠️ Aider làm được những gì? (What it does)**
* **Living README**: Tự động phân tích git diff khi commit và vẽ sơ đồ kiến trúc Mermaid cập nhật trực tiếp vào file README.md.
* **PR Automated Reviewer**: Đóng vai trò là một "Architect Bot" trên GitHub, tự động nhận dạng PR, phân tích thay đổi và bình luận sơ đồ Mermaid đề xuất kèm đánh giá kiến trúc.
* **Interactive Dashboard**: Giao diện timeline hiển thị lịch sử thay đổi dưới góc nhìn của PM (tóm tắt nghiệp vụ) và Bác sĩ code (nhận xét kỹ thuật hài hước bằng giọng nói sinh động).

#### **⚙️ Chúng tôi xây dựng nó như thế nào? (How we built it)**
* **AI Engine**: Sử dụng mô hình **Gemini 2.0 Flash** thông qua Google Generative AI SDK để phân tích code diff phức tạp cực kỳ nhanh chóng.
* **Backend**: Node.js, Express, TypeScript được triển khai trên **Google Cloud Run** với cơ chế xác thực bảo mật HMAC SHA-256 đối với GitHub webhook.
* **Frontend**: React, Vite, Tailwind CSS mang lại giao diện tối giản, hiện đại và tích hợp Web Speech API để phát giọng đọc tiếng Việt.
* **CLI Client**: Viết bằng TypeScript đóng gói bằng Commander.js cho phép lập trình viên tương tác trực tiếp bằng dòng lệnh.

#### **🧠 Kỹ thuật tối ưu hóa AI nổi bật (AI Engineering & Smart Design)**
Chúng tôi đã áp dụng các kỹ thuật thiết kế phần mềm cao cấp để tối ưu hóa hiệu năng AI:
1. **Structural Truncation (Thu gọn cấu trúc)**: Khi diff quá lớn (vượt quá 80KB), hệ thống tự động lọc bỏ các chi tiết dòng mã thô và chỉ giữ lại cấu trúc file thay đổi. Điều này giúp tránh vượt giới hạn token và tiết kiệm hơn 90% chi phí gọi API.
2. **Graceful Fallback (Dự phòng thông minh)**: Khi Gemini API gặp sự cố hoặc cạn hạn mức, hệ thống kích hoạt bộ phân tích regex cục bộ để nhận diện các thay đổi dịch vụ quan trọng và tự động chèn node vào Mermaid, đảm bảo tính sẵn sàng 100%.
3. **Async Webhook Processing**: Trả về `202 Accepted` ngay lập tức để tránh timeout 10 giây của GitHub, chạy tác vụ AI bất đồng bộ dưới cấu hình Cloud Run không giới hạn CPU (`--no-cpu-throttling`).

---

## 3. Các từ khóa (Keywords) nên gắn thẻ (Tags) khi nộp bài
* `Gemini API`
* `Google Cloud Run`
* `Developer Tooling`
* `TypeScript/React`
* `Generative AI`
* `DevOps / CI-CD`
