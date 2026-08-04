# Hướng dẫn Cấu hình & Tái tạo Prompt trên Google AI Studio

Tài liệu này chứa chi tiết cấu hình và Prompts đang được sử dụng trong hệ thống Aider Bot để bạn có thể sao chép, thử nghiệm và tối ưu hóa trực tiếp trên [Google AI Studio](https://aistudio.google.com/).

---

## ⚙️ 1. Cấu hình Chung (System Configurations)

Khi tạo một Chat/Freeform Prompt mới trong Google AI Studio, hãy thiết lập các thông số cấu hình ở bảng bên phải (Panel bên phải) như sau:

* **Model**: **`Gemini 2.0 Flash`** (Đây là dòng mô hình khuyên dùng cho tốc độ phản hồi nhanh dưới 10s và xử lý diff tốt).
* **System Instructions**: *(Xem chi tiết ở mục 2)*.
* **Temperature**: **`0.2`** (Thiết lập thấp để mô hình đưa ra kết quả nhất quán, cấu trúc Mermaid chính xác và định dạng JSON chuẩn, tránh sự sáng tạo quá mức gây lỗi cú pháp).
* **Safety Settings**: Giữ ở mức **`Block some`** hoặc **`Default`**.
* **Advanced Settings -> Response MIME Type**: Chọn **`application/json`** (Rất quan trọng! Thiết lập này ép mô hình bắt buộc phải trả về JSON hợp lệ, tránh việc mô hình trả về kèm theo các khối ký tự markdown ```json ... ``` làm lỗi parser).

---

## 📝 2. Chỉ thị Hệ thống (System Instructions)

Dán toàn bộ đoạn văn bản dưới đây vào ô **System Instructions** ở phía trên cùng của Google AI Studio:

```text
You are an expert system architect and technical writer. 
You will analyze a code diff and directory structure, then update the Mermaid diagram representing the codebase.
You must add new nodes and connections for any new services, modules, or key components introduced in the diff (for example, if an AudioService is introduced, you must add an Audio Service node connected to the API Gateway).
You must return a JSON response containing:
1. commitMessage: conventional commit format (feat/fix/chore)
2. updatedMermaid: updated graph syntax. Mark changed components.
3. pmSummary: friendly Vietnamese summary.
4. audioScript: funny 15s recap script.
Return ONLY raw JSON. No markdown ticks.
```

---

## 📥 3. Cấu trúc Prompt Đầu vào (User Prompt Template)

Dán cấu trúc này vào khung nhập liệu của người dùng (**User Prompt**). Thay thế các giá trị tương ứng để chạy thử nghiệm:

```text
Current Mermaid Diagram:
<Dán sơ đồ Mermaid hiện tại ở đây - Ví dụ dưới đây>
graph TD
  AUTH[Auth Service] --> API[Backend API Gateway]
  API --> DB[Firestore Database]

Directory Structure:
<Dán danh sách file của dự án ở đây - Ví dụ dưới đây>
backend/src/server.ts
backend/src/services/github.ts
backend/src/services/audio.ts
frontend/src/App.tsx

Git Diff:
<Dán đoạn git diff cần phân tích ở đây - Ví dụ dưới đây>
diff --git a/backend/src/services/audio.ts b/backend/src/services/audio.ts
new file mode 100644
index 0000000..1234567
--- /dev/null
+++ b/backend/src/services/audio.ts
@@ -0,0 +1,10 @@
+export class AudioService {
+  async synthesizeSpeech(text: string): Promise<Buffer> {
+    // Mock synthesize
+    return Buffer.from("audio");
+  }
+}
```

---

## 📤 4. Định dạng Đầu ra Kỳ vọng (Expected Output JSON)

Nếu cấu hình chính xác, mô hình sẽ trả về kết quả dạng JSON thô (Raw JSON) có dạng:

```json
{
  "commitMessage": "feat(audio): integrate AudioService for project recaps",
  "updatedMermaid": "graph TD\n  AUTH[Auth Service] --> API[Backend API Gateway]\n  API --> DB[Firestore Database]\n  API --> AUDIO[Audio Service]",
  "pmSummary": "Tích hợp dịch vụ âm thanh AudioService giúp tự động tạo các bản tóm tắt dự án bằng giọng nói sinh động.",
  "audioScript": "Bác sĩ code nhận xét: Audio Service đã online rồi nhé! Giọng đọc nghe bánh cuốn lắm, duyệt luôn!"
}
```
