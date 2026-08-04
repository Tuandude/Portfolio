# Blueprint: Hướng dẫn Cấu hình Aider Bot trên Google AI Studio

Tài liệu này chứa toàn bộ các thông số kỹ thuật, cấu hình, System Instructions, JSON Schema và Few-shot Examples được bóc tách từ dự án Aider để bạn thiết lập chạy 1:1 trên Google AI Studio.

---

## 1. Cấu hình Tham số Kỹ thuật (Configuration Parameters)

Khi mở giao diện Google AI Studio, hãy chọn mô hình và cấu hình các tham số ở bảng điều khiển bên phải (Settings panel) như sau:

*   **Model**: `Gemini 2.0 Flash` (Mô hình tối ưu cho tốc độ và khả năng phân tích mã nguồn).
*   **Temperature**: `1.0` (Bạn có thể hạ xuống `0.7` nếu muốn kết quả sơ đồ Mermaid và tóm tắt mang tính chuẩn hóa và nhất quán cao hơn).
*   **Response MIME Type**: Chọn **`application/json`** (Đây là tính năng cực kỳ quan trọng trên AI Studio để ép buộc mô hình luôn trả về cấu trúc JSON hợp lệ, tránh lỗi trả về các ký tự Markdown thừa).
*   **JSON Schema**: Nhấp vào nút cấu hình Schema bên cạnh tùy chọn JSON và dán đoạn Schema dưới đây:

```json
{
  "type": "OBJECT",
  "properties": {
    "commitMessage": {
      "type": "STRING",
      "description": "Conventional commit format (feat/fix/chore/docs) based on the diff"
    },
    "updatedMermaid": {
      "type": "STRING",
      "description": "Updated Mermaid diagram syntax reflecting the architectural changes"
    },
    "pmSummary": {
      "type": "STRING",
      "description": "Friendly business-focused summary of the changes in Vietnamese"
    },
    "audioScript": {
      "type": "STRING",
      "description": "A funny and witty 15-second code review script in Vietnamese from the perspective of 'Code Doctor' (Bác sĩ code)"
    }
  },
  "required": [
    "commitMessage",
    "updatedMermaid",
    "pmSummary",
    "audioScript"
  ]
}
```

---

## 2. Chỉ dẫn Hệ thống (System Instructions)

Dán đoạn chỉ dẫn dưới đây vào khung nhập liệu **System Instructions** ở phía trên màn hình:

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

## 3. Dữ liệu Mẫu (Few-Shot Examples / Structured Input-Output Pairs)

Để mô hình hiểu sâu hơn về nghiệp vụ vẽ sơ đồ và tóm tắt, hãy thiết lập một ví dụ mẫu (Few-shot example). Trong Google AI Studio, bạn có thể thêm ví dụ bằng cách tạo **Structured Prompt** hoặc nhập các cặp **Input / Output** dưới đây:

### **Ví dụ 1:**

#### 📥 **Input (Dữ liệu đầu vào)**
```text
Current Mermaid Diagram:
graph TD
  AUTH[Auth Service] --> API[Backend API Gateway]
  API --> DB[Firestore Database]

Directory Structure:
backend/package.json
backend/src/server.ts
backend/src/services/github.ts
backend/src/services/audio.ts

Git Diff:
diff --git a/backend/src/services/audio.ts b/backend/src/services/audio.ts
new file mode 100644
index 0000000..f6b2190
--- /dev/null
+++ b/backend/src/services/audio.ts
@@ -0,0 +1,10 @@
+export class AudioService {
+  async synthesizeSpeech(text: string) {
+    console.log("Synthesizing speech: " + text);
+  }
+}
```

#### 📤 **Output (Dữ liệu đầu ra mong đợi)**
```json
{
  "commitMessage": "feat(audio): add AudioService for speech synthesis",
  "updatedMermaid": "graph TD\n  AUTH[Auth Service] --> API[Backend API Gateway]\n  API --> DB[Firestore Database]\n  API --> AUDIO[Audio Service]",
  "pmSummary": "Tích hợp dịch vụ âm thanh AudioService mới để xử lý chuyển đổi văn bản nhận xét thành giọng nói sinh động.",
  "audioScript": "Bác sĩ code nhận xét: Ôi trời, Audio Service đã online rồi! Từ nay tôi có thể trực tiếp nói cho các bạn biết code các bạn 'nát' thế nào rồi nhé!"
}
```

---

## 4. Hướng dẫn Xuất Link & Kiểm thử (Verification & Share)

1. **Lưu Prompt**:
   - Bấm vào nút **`Save`** ở góc trên bên trái giao diện Google AI Studio.
   - Đặt tên cho prompt của bạn (ví dụ: `Aider-Biographer-Bot-Engine`).
2. **Kiểm thử trực tiếp**:
   - Ở phía dưới cùng, dán một đoạn diff chạy thử và bấm **`Run`**.
   - Kiểm tra kết quả trả về trong ô Output. Kết quả phải là JSON sạch, không có dấu tick markdown (vì Response MIME Type là `application/json`), các trường thông tin hiển thị chính xác.
3. **Bật chia sẻ để lấy Link nộp bài**:
   - Bấm nút **`Share`** ở góc trên bên phải.
   - Chọn **`Enable sharing`**.
   - Copy đường dẫn chính thức (dạng `https://aistudio.google.com/prompts/...` hoặc `https://aistudio.google.com/sharing/...`) và nộp vào form cuộc thi.
