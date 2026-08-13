# Aider - Automated Code Review System (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nâng cấp cốt lõi Aider Bot thành hệ thống tự động review PR chính thức trên GitHub, tránh trùng lặp comment bằng cách tự động cập nhật (PATCH) và đọc tài liệu dự án để review nghiệp vụ (business domain).

**Architecture:** 
* Nâng cấp `GitHubService` để hỗ trợ tìm kiếm comment cũ qua thẻ ẩn `<!-- AIDER-BOT-REVIEW-COMMENT -->` và thực hiện `PATCH` thay vì `POST` mới.
* Tích hợp GitHub PR Reviews API (`POST /repos/{owner}/{repo}/pulls/{pr}/reviews`) để đưa ra trạng thái chính thức `APPROVE` / `REQUEST_CHANGES` / `COMMENT` thay vì chỉ comment thông thường.
* Thêm module quét tài liệu trong thư mục `docs/` để đưa vào Gemini prompt làm bối cảnh nghiệp vụ.

**Tech Stack:** TypeScript, Node.js, Express, Axios, `@google/generative-ai`

## Global Constraints
* Toàn bộ mã nguồn backend sử dụng TypeScript.
* Luôn sử dụng `timingSafeEqual` khi xác thực webhook để chống Timing Attacks.
* Đảm bảo webhook phản hồi trạng thái `202 Accepted` ngay lập tức, các tác vụ phân tích chạy ngầm hoàn toàn.

---

### Task 1: Tránh trùng lặp comment (PATCH comment cũ)

**Files:**
* Modify: [github.ts](file:///c:/Users/OS/PROJECT1/backend/src/services/github.ts) (Thêm hàm `getExistingComment` và cập nhật `postComment` thành `postOrUpdateComment`)
* Test: Create `backend/src/services/__tests__/github.test.ts` (Kiểm thử mock axios cho việc GET và PATCH comment)

**Interfaces:**
* Produces: `postOrUpdateComment(owner: string, repo: string, issueNumber: number, body: string): Promise<void>`

- [ ] **Step 1: Viết test kiểm thử lỗi (Failing Test)**
  Tạo file `backend/src/services/__tests__/github.test.ts` để kiểm thử logic: nếu API trả về một comment có chứa `<!-- AIDER-BOT-REVIEW-COMMENT -->` thì hàm `postOrUpdateComment` sẽ gọi Axios PATCH, ngược lại gọi Axios POST.

  ```typescript
  import { GitHubService } from '../github';
  import axios from 'axios';
  jest.mock('axios');

  describe('GitHubService - postOrUpdateComment', () => {
    it('should PATCH if comment already exists', async () => {
      // Mock axios.get to return a list with bot comment
      // Mock axios.patch to be called
    });
  });
  ```

- [ ] **Step 2: Chạy test để xác nhận lỗi (Verify Fail)**
  Chạy: `npm test backend/src/services/__tests__/github.test.ts` (hoặc lệnh test tương đương) và đảm bảo kiểm thử thất bại do hàm chưa được định nghĩa.

- [ ] **Step 3: Viết mã triển khai (Implementation)**
  Cập nhật [github.ts](file:///c:/Users/OS/PROJECT1/backend/src/services/github.ts):
  * Thêm logic gọi `GET https://api.github.com/repos/{owner}/{repo}/issues/{issueNumber}/comments` để tìm comment chứa thẻ `<!-- AIDER-BOT-REVIEW-COMMENT -->`.
  * Nếu tìm thấy comment có ID là `X`, gọi `PATCH https://api.github.com/repos/{owner}/{repo}/issues/comments/X`.
  * Nếu không tìm thấy, gọi `POST https://api.github.com/repos/{owner}/{repo}/issues/{issueNumber}/comments`.

- [ ] **Step 4: Chạy test để xác nhận vượt qua (Verify Pass)**
  Chạy kiểm thử và đảm bảo tất cả kiểm thử đã PASS.

- [ ] **Step 5: Commit**
  ```bash
  git add backend/src/services/github.ts backend/src/services/__tests__/github.test.ts
  git commit -m "feat(webhook): avoid duplicate comments by patching existing review comments"
  ```

---

### Task 2: Quét và Đọc tài liệu dự án (Docs Context Loader)

**Files:**
* Create: `backend/src/utils/docsLoader.ts` (Hàm đọc tất cả file `.md` trong thư mục `docs/`)
* Test: Create `backend/src/utils/__tests__/docsLoader.test.ts` (Kiểm thử đọc file markdown giả lập)

**Interfaces:**
* Produces: `loadProjectDocs(docsDirPath: string): Promise<string>` - Trả về nội dung gộp của các file tài liệu.

- [ ] **Step 1: Viết test kiểm thử lỗi**
  Viết kiểm thử để verify `loadProjectDocs` đọc chính xác thư mục chứa tài liệu markdown và loại bỏ các file/thư mục không phải markdown.

- [ ] **Step 2: Chạy test để xác nhận lỗi**
  Chạy và verify lỗi.

- [ ] **Step 3: Triển khai minimal code**
  Đọc đệ quy thư mục `docs/` dùng `fs.promises.readdir` và `fs.promises.readFile`. Lọc chỉ lấy các file `.md` (bỏ qua các file cấu hình khác). Ghép nội dung lại theo định dạng:
  ```markdown
  --- File: [tên_file] ---
  [Nội dung file]
  ```

- [ ] **Step 4: Chạy test để xác nhận vượt qua**
  Chạy lại kiểm thử và đảm bảo PASS.

- [ ] **Step 5: Commit**
  ```bash
  git add backend/src/utils/docsLoader.ts backend/src/utils/__tests__/docsLoader.test.ts
  git commit -m "feat(webhook): add utility to recursively load project markdown docs for context"
  ```

---

### Task 3: Tích hợp GitHub PR Reviews API (Approve / Request Changes)

**Files:**
* Modify: [github.ts](file:///c:/Users/OS/PROJECT1/backend/src/services/github.ts) (Thêm hàm `submitReview`)
* Modify: [server.ts](file:///c:/Users/OS/PROJECT1/backend/src/server.ts) (Tích hợp quét docs và thay đổi cấu trúc Prompt Gemini, gọi `submitReview`)
* Test: Cập nhật `backend/src/services/__tests__/github.test.ts` để kiểm thử hàm `submitReview`

**Interfaces:**
* Produces: 
  * `submitReview(owner: string, repo: string, prNumber: number, body: string, event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT'): Promise<void>`

- [ ] **Step 1: Viết test kiểm thử lỗi**
  Viết test mock cho `submitReview` để đảm bảo nó gọi API `POST /repos/{owner}/{repo}/pulls/{prNumber}/reviews` với đúng tham số payload.

- [ ] **Step 2: Chạy test để xác nhận lỗi**
  Chạy và verify lỗi.

- [ ] **Step 3: Triển khai và tích hợp**
  * Trong [github.ts](file:///c:/Users/OS/PROJECT1/backend/src/services/github.ts): Implement hàm `submitReview`.
  * Trong [server.ts](file:///c:/Users/OS/PROJECT1/backend/src/server.ts):
    * Gọi `loadProjectDocs` từ `backend/src/utils/docsLoader.ts` để lấy bối cảnh nghiệp vụ.
    * Cập nhật `systemInstruction` của Gemini để trả về thêm trường `reviewDecision` với các giá trị: `APPROVE`, `REQUEST_CHANGES`, hoặc `COMMENT` dựa trên phân tích diff so với tài liệu.
    * Gọi `submitReview` thay thế hoặc kết hợp với `postOrUpdateComment` để đưa ra quyết định review chính thức trên PR.

- [ ] **Step 4: Chạy test để xác nhận vượt qua**
  Chạy toàn bộ unit tests và đảm bảo PASS.

- [ ] **Step 5: Commit**
  ```bash
  git add backend/src/services/github.ts backend/src/server.ts
  git commit -m "feat(webhook): integrate GitHub Review API to submit official reviews based on Gemini decision"
  ```
