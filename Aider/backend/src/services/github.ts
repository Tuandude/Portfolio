import axios from 'axios';

export class GitHubService {
  private token: string;

  constructor() {
    this.token = process.env.GITHUB_TOKEN || '';
  }

  /**
   * Tải nội dung diff (.diff) của Pull Request
   */
  async downloadDiff(diffUrl: string): Promise<string> {
    try {
      console.log(`Downloading PR diff from: ${diffUrl}`);
      const headers: Record<string, string> = {
        'User-Agent': 'Aider-Biographer-Bot',
      };
      if (this.token) {
        headers['Authorization'] = `token ${this.token}`;
      }
      const response = await axios.get(diffUrl, { headers });
      return response.data;
    } catch (err: any) {
      console.error(`Failed to download diff: ${err.message}`);
      throw new Error(`Failed to download PR diff: ${err.message}`);
    }
  }

  /**
   * Lấy danh sách file (file tree) của một nhánh/commit cụ thể qua GitHub API
   */
  async getFileTree(owner: string, repo: string, treeSha: string): Promise<string> {
    try {
      console.log(`Fetching file tree for ref: ${treeSha}`);
      const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`;
      const headers: Record<string, string> = {
        'User-Agent': 'Aider-Biographer-Bot',
      };
      if (this.token) {
        headers['Authorization'] = `token ${this.token}`;
      }

      const response = await axios.get(url, { headers });
      const tree = response.data.tree || [];
      const files = tree
        .filter((item: any) => {
          if (item.type !== 'blob') return false;
          const p = item.path;
          return !p.startsWith('node_modules/') &&
                 !p.startsWith('.agents/') &&
                 !p.startsWith('.git/') &&
                 !p.startsWith('.github/') &&
                 !p.startsWith('.gstack/') &&
                 !p.startsWith('docs/superpowers/') &&
                 !p.startsWith('dist/') &&
                 !p.includes('package-lock.json') &&
                 !p.includes('yarn.lock') &&
                 !p.includes('pnpm-lock.yaml');
        })
        .map((item: any) => item.path);
      
      return files.join('\n');
    } catch (err: any) {
      console.warn(`Failed to fetch file tree: ${err.message}. Using empty fallback.`);
      return '';
    }
  }

  /**
   * Viết bình luận (comment) lên Pull Request/Issue
   */
  async postComment(owner: string, repo: string, issueNumber: number, body: string): Promise<void> {
    return this.postOrUpdateComment(owner, repo, issueNumber, body);
  }

  /**
   * Tìm kiếm comment cũ của bot và cập nhật (PATCH), hoặc tạo mới (POST) nếu không tìm thấy
   */
  async postOrUpdateComment(owner: string, repo: string, issueNumber: number, body: string): Promise<void> {
    if (!this.token) {
      console.warn('[GitHub Warning] GITHUB_TOKEN is not configured. Cannot post or update comment to PR.');
      return;
    }

    try {
      const listUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`;
      const headers = {
        'User-Agent': 'Aider-Biographer-Bot',
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
      };

      console.log(`Fetching comments on PR #${issueNumber} to check for duplicates`);
      const response = await axios.get(listUrl, { headers });
      const comments = response.data || [];
      
      // Tìm comment của bot chứa tag nhận diện ẩn
      const botComment = comments.find((c: any) => c.body && c.body.includes('<!-- AIDER-BOT-REVIEW-COMMENT -->'));

      if (botComment) {
        console.log(`Found existing bot comment ID: ${botComment.id}. Updating it...`);
        const updateUrl = `https://api.github.com/repos/${owner}/${repo}/issues/comments/${botComment.id}`;
        await axios.patch(updateUrl, { body }, { headers });
        console.log('PR comment updated successfully via PATCH!');
      } else {
        console.log('No existing bot comment found. Creating new one...');
        await axios.post(listUrl, { body }, { headers });
        console.log('PR comment created successfully via POST!');
      }
    } catch (err: any) {
      console.error(`Failed to post or update PR comment: ${err.message}`);
      throw new Error(`Failed to post or update PR comment: ${err.message}`);
    }
  }

  /**
   * Submit Review chính thức (APPROVE, REQUEST_CHANGES, hoặc COMMENT) lên Pull Request
   */
  async submitReview(
    owner: string,
    repo: string,
    prNumber: number,
    body: string,
    event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT'
  ): Promise<void> {
    if (!this.token) {
      console.warn('[GitHub Warning] GITHUB_TOKEN is not configured. Cannot submit PR review.');
      return;
    }

    try {
      console.log(`Submitting PR review (${event}) to PR #${prNumber} on ${owner}/${repo}`);
      const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/reviews`;
      const headers = {
        'User-Agent': 'Aider-Biographer-Bot',
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
      };

      await axios.post(url, { body, event }, { headers });
      console.log('PR review submitted successfully!');
    } catch (err: any) {
      console.error(`Failed to submit PR review: ${err.message}`);
      throw new Error(`Failed to submit PR review: ${err.message}`);
    }
  }

  /**
   * Tự động merge Pull Request khi thỏa mãn điều kiện
   */
  async mergePullRequest(owner: string, repo: string, prNumber: number): Promise<void> {
    if (!this.token) {
      console.warn('[GitHub Warning] GITHUB_TOKEN is not configured. Cannot merge Pull Request.');
      return;
    }

    try {
      console.log(`Auto-merging PR #${prNumber} on ${owner}/${repo}`);
      const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/merge`;
      const headers = {
        'User-Agent': 'Aider-Biographer-Bot',
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
      };

      const payload = {
        commit_title: `chore(auto-merge): merge PR #${prNumber} automatically via Aider Bot`,
        merge_method: 'squash'
      };

      await axios.put(url, payload, { headers });
      console.log(`PR #${prNumber} merged successfully!`);
    } catch (err: any) {
      console.error(`Failed to merge PR: ${err.message}`);
      throw new Error(`Failed to merge PR: ${err.message}`);
    }
  }

  /**
   * Tự động tạo mới hoặc cập nhật một Issue báo cáo hiệu suất ghim trên GitHub
   */
  async postOrUpdateIssueReport(owner: string, repo: string, body: string): Promise<void> {
    if (!this.token) {
      console.warn('[GitHub Warning] GITHUB_TOKEN is not configured. Cannot post or update Issue report.');
      return;
    }

    const title = '📊 Báo cáo Hiệu suất Lập trình viên & Chất lượng Code (Aider Bot)';
    try {
      const listUrl = `https://api.github.com/repos/${owner}/${repo}/issues?state=open`;
      const headers = {
        'User-Agent': 'Aider-Biographer-Bot',
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
      };

      console.log(`Searching for existing report Issue on ${owner}/${repo}`);
      const response = await axios.get(listUrl, { headers });
      const issues = response.data || [];
      
      const reportIssue = issues.find((issue: any) => issue.title === title);

      if (reportIssue) {
        console.log(`Found existing report Issue #${reportIssue.number}. Updating its body...`);
        const updateUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${reportIssue.number}`;
        await axios.patch(updateUrl, { body }, { headers });
        console.log('GitHub Issue report updated successfully via PATCH!');
      } else {
        console.log('No existing report Issue found. Creating a new one...');
        const createUrl = `https://api.github.com/repos/${owner}/${repo}/issues`;
        await axios.post(createUrl, { 
          title, 
          body,
          labels: ['aider-bot-report']
        }, { headers });
        console.log('GitHub Issue report created successfully via POST!');
      }
    } catch (err: any) {
      console.error(`Failed to post or update GitHub Issue report: ${err.message}`);
      throw new Error(`Failed to post or update GitHub Issue report: ${err.message}`);
    }
  }
}
