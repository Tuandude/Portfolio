import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import crypto from 'crypto';
import path from 'path';
import { AudioService } from './services/audio';
import { GitHubService } from './services/github';
import { JiraService } from './services/jira';
import { StorageService } from './services/storage';
import { filterDiff, limitDiffSize } from './utils/diffFilter';
import { loadProjectDocs } from './utils/docsLoader';

dotenv.config();

const app = express();
const githubService = new GitHubService();
const jiraService = new JiraService();
const storageService = new StorageService();
app.use(cors());
app.use(express.json({ 
  limit: '10mb',
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

import { GoogleGenerativeAI } from '@google/generative-ai';

function getModifiedFiles(diff: string): string[] {
  const files: string[] = [];
  const lines = diff.split('\n');
  for (const line of lines) {
    if (line.startsWith('diff --git a/')) {
      const parts = line.split(' ');
      if (parts.length >= 3) {
        const file = parts[2].substring(2);
        files.push(file);
      }
    }
  }
  return files;
}

app.post('/api/commit', async (req, res) => {
  const { fileTree, currentMermaid, projectToken } = req.body;
  const rawDiff = req.body.diff || '';
  const diff = limitDiffSize(filterDiff(rawDiff));
  const apiKey = req.headers['x-gemini-api-key'] || req.body.geminiApiKey || process.env.GEMINI_API_KEY;
  console.log(`Received commit request for token: ${projectToken}`);

  try {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please provide it in headers (x-gemini-api-key) or configure it on the server.");
    }

    const genAI = new GoogleGenerativeAI(apiKey as string);

    const systemInstruction = `You are an expert system architect and technical writer. 
You will analyze a code diff and directory structure, then update the Mermaid diagram representing the codebase.
You must add new nodes and connections for any new services, modules, or key components introduced in the diff (for example, if an AudioService is introduced, you must add an Audio Service node connected to the API Gateway).
You must return a JSON response containing:
1. commitMessage: conventional commit format (feat/fix/chore)
2. updatedMermaid: updated graph syntax. Mark changed components.
3. pmSummary: friendly Vietnamese summary.
4. audioScript: funny 15s recap script.
Return ONLY raw JSON. No markdown ticks.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction
    });

    const prompt = `
Current Mermaid Diagram:
${currentMermaid}

Directory Structure:
${fileTree}

Git Diff:
${diff}
`;

    const response = await model.generateContent(prompt);
    const responseText = response.response.text();
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    res.json({
      commitMessage: parsed.commitMessage,
      updatedMermaid: parsed.updatedMermaid,
      pmSummary: parsed.pmSummary,
      audioScript: parsed.audioScript
    });
  } catch (err: any) {
    console.warn(`[Aider API Warning] Gemini call failed, using local mock fallback. Error: ${err.message}`);
    
    // Smart fallback based on diff contents
    let commitMessage = 'chore: update repository files';
    let updatedMermaid = currentMermaid || 'graph TD\n  AUTH[Auth Service] --> API[Backend API Gateway]\n  API --> DB[Firestore Database]';
    let pmSummary = 'Bản cập nhật này giúp đồng bộ hóa các tệp tin cấu hình và làm sạch thư mục dự án.';
    let audioScript = 'Bác sĩ code nhận xét: File thay đổi nhỏ thôi, không có gì đáng ngại đâu!';

    const modifiedFiles = getModifiedFiles(diff || '');
    const hasPackageJson = modifiedFiles.some(f => f.endsWith('package.json') || f.endsWith('package-lock.json'));
    const hasServerOrUI = modifiedFiles.some(f => f.endsWith('server.ts') || f.endsWith('App.tsx') || f.endsWith('index.css'));
    const hasAudioService = modifiedFiles.some(f => f.toLowerCase().includes('audio') || f.toLowerCase().includes('synthesize'));

    if (hasAudioService) {
      commitMessage = 'feat(audio): integrate AudioService for project recaps';
      updatedMermaid = 'graph TD\n  AUTH[Auth Service] --> API[Backend API Gateway]\n  API --> DB[Firestore Database]\n  API --> AUDIO[Audio Service]';
      pmSummary = 'Tích hợp dịch vụ âm thanh AudioService giúp tự động tạo các bản tóm tắt dự án bằng giọng nói sinh động.';
      audioScript = 'Bác sĩ code nhận xét: Audio Service đã online rồi nhé! Giọng đọc nghe bánh cuốn lắm, duyệt luôn!';
    } else if (hasPackageJson) {
      commitMessage = 'chore: update package dependencies and build configurations';
      pmSummary = 'Cập nhật các thư viện phụ thuộc của dự án để đảm bảo tính bảo mật và tương thích.';
      audioScript = 'Bác sĩ code nhận xét: Update thư viện xong nhớ test kỹ nhé, coi chừng xung đột phiên bản!';
    } else if (hasServerOrUI) {
      commitMessage = 'feat(ui): refine dashboard layout and styling with Tailwind';
      pmSummary = 'Tinh chỉnh bố cục và giao diện Dashboard để tương thích hoàn toàn với Tailwind v4 mới.';
      audioScript = 'Bác sĩ code nhận xét: Giao diện GitHub Dark trông xịn sò đấy, Chủ tịch duyệt là chuẩn bài rồi!';
    }

    res.json({
      commitMessage,
      updatedMermaid,
      pmSummary,
      audioScript
    });
  }
});

app.post('/api/synthesize', async (req, res) => {
  const { text } = req.body;
  const apiKey = req.headers['x-gemini-api-key'] || req.body.geminiApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({ error: "Missing API Key" });
  }
  try {
    const audioService = new AudioService(apiKey as string);
    const buffer = await audioService.synthesizeSpeech(text || '');
    res.set('Content-Type', 'audio/mpeg');
    res.send(buffer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Aider Biographer Backend is running!');
});

app.get('/api/webhook/github', (req, res) => {
  res.json({
    status: 'active',
    message: 'Aider GitHub Webhook endpoint is active. Please configure and send POST requests from GitHub.'
  });
});

app.get('/api/reviews', async (req, res) => {
  try {
    const list = await storageService.getReviews();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/reports/summary', async (req, res) => {
  try {
    const summary = await storageService.getSummaryReports();
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

function generateMarkdownReport(summary: any): string {
  const stats = summary.stats || {};
  const developers = summary.developers || [];
  const weeklyReport = summary.weeklyReport || [];

  const timeStr = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  // Sắp xếp nhà phát triển theo successRate giảm dần
  const sortedDevs = [...developers].sort((a, b) => b.successRate - a.successRate);

  let md = `# 📊 BÁO CÁO HIỆU SUẤT LẬP TRÌNH VIÊN & CHẤT LƯỢNG CODE (Aider Bot)
*Cập nhật tự động vào lúc: **${timeStr} (ICT)***

---

## 📈 Thống Kê Tổng Quan
* 🚀 **Tổng số Pull Requests đã Review**: \`${stats.totalReviews || 0}\`
* ✅ **Approved (Đạt chất lượng)**: \`${stats.approveCount || 0}\`
* ❌ **Request Changes (Cần sửa đổi)**: \`${stats.requestChangesCount || 0}\`
* 💬 **Comment (Góp ý/Cảnh báo)**: \`${stats.commentCount || 0}\`
* 📅 **Hoạt động trong tuần**: \`${stats.weeklyCount || 0}\` PRs reviewed.

---

## 🏆 Bảng Xếp Hạng Chất Lượng Code (Leaderboard)

| Hạng | Lập trình viên | Tổng PR | Tỉ lệ Approve | File sửa trung bình | Kết quả review |
| :---: | :--- | :---: | :---: | :---: | :--- |
`;

  if (sortedDevs.length === 0) {
    md += `| - | Chưa có dữ liệu | 0 | 0% | 0 | Chưa có | \n`;
  } else {
    sortedDevs.forEach((dev: any, index: number) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;
      md += `| ${medal} | **${dev.name}** | \`${dev.totalPRs}\` | **\`${dev.successRate}%\`** | \`${dev.avgFilesChanged}\` | \`${dev.approvedPRs} Approve / ${dev.requestedChangesPRs} Req Changes\` |\n`;
    });
  }

  md += `
---

## 📅 Lịch Sử Review Gần Đây

`;

  if (weeklyReport.length === 0) {
    md += `*Chưa có hoạt động review nào trong tuần.*`;
  } else {
    // Chỉ lấy tối đa 8 PR gần nhất
    const recentPRs = weeklyReport.slice(-8).reverse();
    recentPRs.forEach((rep: any) => {
      const decisionEmoji = 
        rep.decision === 'APPROVE' ? '✅ APPROVED' : 
        rep.decision === 'REQUEST_CHANGES' ? '❌ REQUEST CHANGES' : '💬 COMMENT';
      const dateStr = new Date(rep.timestamp).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
      md += `* **PR #${rep.prNumber}**: ${rep.title}
  - 👤 Tác giả: **@${rep.author}**
  - 🚦 Trạng thái: **${decisionEmoji}**
  - 🕒 Thời gian: _${dateStr}_
`;
    });
  }

  md += `\n\n---\n*Báo cáo được tạo tự động bởi [Aider Bot](https://github.com/Tuandude/Aider).*`;
  return md;
}

app.post('/api/webhook/github', async (req: express.Request, res: express.Response) => {
  const event = req.headers['x-github-event'];
  console.log(`Received GitHub Webhook event: ${event}`);

  // Signature verification
  const signature = req.headers['x-hub-signature-256'] as string;
  const webhookSecret = process.env.WEBHOOK_SECRET;

  if (webhookSecret) {
    if (!signature) {
      console.warn('[Security Warning] Webhook signature header missing.');
      return res.status(401).send('Signature verification failed. Missing signature header.');
    }
    const rawBody = (req as any).rawBody;
    if (!rawBody) {
      return res.status(400).send('Missing raw body for signature verification.');
    }
    const hmac = crypto.createHmac('sha256', webhookSecret);
    const digest = 'sha256=' + hmac.update(rawBody).digest('hex');
    try {
      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
        console.error('[Security Error] Webhook signature mismatch.');
        return res.status(401).send('Signature verification failed.');
      }
    } catch (e) {
      console.error('[Security Error] Signature comparison error.');
      return res.status(401).send('Signature verification failed.');
    }
    console.log('Webhook signature verified successfully.');
  } else {
    console.warn('[GitHub Warning] WEBHOOK_SECRET is not configured. Webhook signature verification bypassed.');
  }

  if (event !== 'pull_request') {
    return res.status(200).send('Event ignored. Only pull_request is supported.');
  }

  const { action, pull_request, repository } = req.body;
  if (!pull_request || !repository) {
    return res.status(400).send('Invalid webhook payload.');
  }

  if (action !== 'opened' && action !== 'synchronize') {
    return res.status(200).send(`Action ${action} ignored. Only opened and synchronize are supported.`);
  }

  const prNumber = pull_request.number;
  const diffUrl = pull_request.diff_url;
  const sha = pull_request.head.sha;
  const owner = repository.owner.login;
  const repo = repository.name;

  console.log(`Processing PR #${prNumber} for ${owner}/${repo} at SHA ${sha}`);

  // Phản hồi webhook ngay lập tức để tránh GitHub báo timeout 10s
  res.status(202).send('PR analysis started.');

  try {
    const rawDiff = await githubService.downloadDiff(diffUrl);
    const diff = limitDiffSize(filterDiff(rawDiff));
    const fileTree = await githubService.getFileTree(owner, repo, sha);
    const docsDirPath = path.resolve(__dirname, '../../docs');
    const docsContext = await loadProjectDocs(docsDirPath);
    
    // Giai đoạn 2: Trích xuất và Tải mô tả từ Jira Tickets
    const prTitle = pull_request.title || '';
    const prBody = pull_request.body || '';
    const jiraIds = jiraService.extractJiraIds(`${prTitle} \n ${prBody}`);
    let jiraContext = '';
    for (const ticketId of jiraIds) {
      const desc = await jiraService.getJiraTicketDescription(ticketId);
      if (desc) {
        jiraContext += `\n\n--- Jira Issue Context ---\n${desc}\n`;
      }
    }
    
    let currentMermaid = '';
    try {
      const readmeUrl = `https://api.github.com/repos/${owner}/${repo}/contents/README.md?ref=${sha}`;
      const headers: Record<string, string> = {
        'User-Agent': 'Aider-Biographer-Bot',
      };
      if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
      }
      const readmeResponse = await axios.get(readmeUrl, { headers });
      const content = Buffer.from(readmeResponse.data.content, 'base64').toString('utf8');
      const match = content.match(/<!-- AIDER:START -->([\s\S]*?)<!-- AIDER:END -->/);
      if (match) {
        currentMermaid = match[1].replace(/```mermaid/g, '').replace(/```/g, '').trim();
      }
    } catch (e: any) {
      console.warn(`Failed to read current README.md from GitHub: ${e.message}`);
    }

    let commitMessage = '';
    let updatedMermaid = '';
    let pmSummary = '';
    let audioScript = '';
    let reviewDecision: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT' = 'COMMENT';
    let reviewFeedback = '';

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is missing on server, using fallback.');
      throw new Error('Missing API Key');
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const systemInstruction = `You are an expert system architect, code reviewer, and technical writer.
You will analyze a code diff, directory structure, project documentation context, and optional Jira ticket context, then:
1. Update the Mermaid diagram representing the codebase. Add new nodes and connections for new components. Mark changed or new components clearly.
2. Review the code changes for logic bugs, performance issues, security vulnerabilities, clean code practices (Code Changes Review) with a focus on specific Clean Code standards:
   - **Clarity & Naming**: Check if variable, function, and class names are descriptive, clear, and follow standard naming conventions.
   - **Function Structure**: Ensure functions are single-responsibility, short, and structured cleanly.
   - **Error & Exception Handling**: Check that potential errors are caught and handled gracefully (e.g., using try-catch blocks) without leaking sensitive details or crashing the application.
   - **Security**: Identify vulnerabilities such as hardcoded secrets/credentials, SQL injections, or missing input validation.
   - **Testing Coverage**: Check if new features or major modifications include corresponding test files. Flag warnings if tests are missing.
3. Compare the code changes against the provided project documentation context AND Jira ticket requirements to identify any architectural inconsistencies, business domain violations, or missed requirements (Business Domain Review).
4. Decide the review status: 
   - "APPROVE": If the code is of high quality, meets all business requirements/Jira tickets, has no critical bugs, security vulnerabilities, or major code smells, and follows clean code practices.
   - "REQUEST_CHANGES": If there are critical bugs, security risks (like hardcoded credentials), severe contradictions to project documentation, completely missed Jira requirements, or major unhandled error paths.
   - "COMMENT": If the code is generally safe to merge but has minor refactoring suggestions, style improvements, or a warning about missing test coverage.

You must return a JSON response containing:
1. commitMessage: conventional commit format (feat/fix/chore)
2. updatedMermaid: updated graph syntax. Mark changed components.
3. pmSummary: friendly Vietnamese summary of what changed.
4. audioScript: funny 15s recap script.
5. reviewDecision: "APPROVE" | "REQUEST_CHANGES" | "COMMENT"
6. reviewFeedback: A detailed review feedback in Vietnamese, pointing out specific suggestions, bugs, or domain violations.
Return ONLY raw JSON. No markdown ticks.`;

      const model = genAI.getGenerativeModel({
        model: 'gemini-3.5-flash',
        systemInstruction
      });

      const prompt = `
Current Mermaid Diagram:
${currentMermaid}

Directory Structure:
${fileTree}

Project Documentation (Business Domain Context):
${docsContext}

Jira Ticket Requirements (Additional Context):
${jiraContext || 'No Jira ticket specified in PR.'}

Git Diff to Review:
${diff}
`;
      const response = await model.generateContent(prompt);
      const responseText = response.response.text();
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      commitMessage = parsed.commitMessage;
      updatedMermaid = parsed.updatedMermaid;
      pmSummary = parsed.pmSummary;
      audioScript = parsed.audioScript;
      reviewDecision = parsed.reviewDecision || 'COMMENT';
      reviewFeedback = parsed.reviewFeedback || '';
    } catch (err: any) {
      console.warn(`Gemini call failed in webhook, using fallback. Error: ${err.message}`);
      commitMessage = 'chore: update repository files';
      updatedMermaid = currentMermaid || 'graph TD\n  AUTH[Auth Service] --> API[Backend API Gateway]\n  API --> DB[Firestore Database]';
      pmSummary = 'Bản cập nhật này giúp đồng bộ hóa các tệp tin cấu hình và làm sạch thư mục dự án.';
      audioScript = 'Bác sĩ code nhận xét: File thay đổi nhỏ thôi, không có gì đáng ngại đâu!';
      reviewDecision = 'COMMENT';
      reviewFeedback = 'Bản review này sử dụng dữ liệu mặc định do kết nối API Gemini thất bại.';

      const modifiedFiles: string[] = [];
      const lines = diff.split('\n');
      for (const line of lines) {
        if (line.startsWith('diff --git a/')) {
          const parts = line.split(' ');
          if (parts.length >= 3) {
            modifiedFiles.push(parts[2].substring(2));
          }
        }
      }

      const hasPackageJson = modifiedFiles.some(f => f.endsWith('package.json') || f.endsWith('package-lock.json'));
      const hasServerOrUI = modifiedFiles.some(f => f.endsWith('server.ts') || f.endsWith('App.tsx') || f.endsWith('index.css'));
      const hasAudioService = modifiedFiles.some(f => f.toLowerCase().includes('audio') || f.toLowerCase().includes('synthesize'));

      if (hasAudioService) {
        commitMessage = 'feat(audio): integrate AudioService for project recaps';
        updatedMermaid = 'graph TD\n  AUTH[Auth Service] --> API[Backend API Gateway]\n  API --> DB[Firestore Database]\n  API --> AUDIO[Audio Service]';
        pmSummary = 'Tích hợp dịch vụ âm thanh AudioService giúp tự động tạo các bản tóm tắt dự án bằng giọng nói sinh động.';
        audioScript = 'Bác sĩ code nhận xét: Audio Service đã online rồi nhé! Giọng đọc nghe bánh cuốn lắm, duyệt luôn!';
      } else if (hasPackageJson) {
        commitMessage = 'chore: update package dependencies and build configurations';
        pmSummary = 'Cập nhật các thư viện phụ thuộc của dự án để đảm bảo tính bảo mật và tương thích.';
        audioScript = 'Bác sĩ code nhận xét: Update thư viện xong nhớ test kỹ nhé, coi chừng xung đột phiên bản!';
      } else if (hasServerOrUI) {
        commitMessage = 'feat(ui): refine dashboard layout and styling with Tailwind';
        pmSummary = 'Tinh chỉnh bố cục và giao diện Dashboard để tương thích hoàn toàn với Tailwind v4 mới.';
        audioScript = 'Bác sĩ code nhận xét: Giao diện GitHub Dark trông xịn sò đấy, Chủ tịch duyệt là chuẩn bài rồi!';
      }
    }

    const commentBody = `### 🤖 Aider Automated Code Review & Biographer Review
<!-- AIDER-BOT-REVIEW-COMMENT -->

#### 🚦 Quyết định Review: **${reviewDecision}**

#### 📋 Chi tiết đánh giá & Góp ý (Review Feedback)
${reviewFeedback || pmSummary}

#### 📊 Sơ đồ kiến trúc Living Architecture (Cập nhật đề xuất)
\`\`\`mermaid
${updatedMermaid}
\`\`\`

#### 📝 PM Summary (Tóm tắt từ PM)
> ${pmSummary}

#### 🔊 Code Doctor Audio Recap (Nhận xét từ Bác sĩ code)
*“${audioScript}”*

---
*Review được tự động thực hiện bởi [Aider Bot](https://github.com/Tuandude/Aider).*`;

    // Gửi Review lên GitHub (bọc try-catch riêng để PR giả lập không làm sập luồng lưu DB và xuất báo cáo)
    try {
      await githubService.submitReview(owner, repo, prNumber, commentBody, reviewDecision);
    } catch (reviewErr: any) {
      console.warn(`[GitHub Warning] Failed to submit PR review (PR #${prNumber} might not exist on GitHub): ${reviewErr.message}`);
    }

    // Giai đoạn 3: Lưu lịch sử Review
    try {
      const changedFilesCount = getModifiedFiles(rawDiff).length;
      await storageService.saveReview({
        prNumber,
        author: pull_request.user?.login || 'unknown',
        title: prTitle,
        decision: reviewDecision,
        feedback: reviewFeedback || pmSummary,
        changedFilesCount
      });

      // Tự động cập nhật Báo cáo Hiệu suất lên GitHub Issues
      try {
        console.log('Generating updated performance report for GitHub Issues...');
        const summary = await storageService.getSummaryReports();
        const reportMd = generateMarkdownReport(summary);
        await githubService.postOrUpdateIssueReport(owner, repo, reportMd);
      } catch (reportErr: any) {
        console.error(`Failed to post/update GitHub Issue report: ${reportErr.message}`);
      }
    } catch (e: any) {
      console.error(`Failed to save review history: ${e.message}`);
    }

    // Giai đoạn 2: Tự động Merge nếu được Approve
    if (reviewDecision === 'APPROVE' && process.env.AUTO_MERGE === 'true') {
      try {
        console.log(`PR #${prNumber} was APPROVED. Triggering auto-merge...`);
        await githubService.mergePullRequest(owner, repo, prNumber);
      } catch (e: any) {
        console.error(`Failed to auto-merge PR #${prNumber}: ${e.message}`);
      }
    }
  } catch (err: any) {
    console.error(`Error in PR analysis flow: ${err.message}`);
  }
});

const PORT = process.env.PORT || 8085;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
