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
        .filter((item: any) => item.type === 'blob')
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
    if (!this.token) {
      console.warn('[GitHub Warning] GITHUB_TOKEN is not configured. Cannot post comment to PR.');
      return;
    }

    try {
      console.log(`Posting review comment to PR #${issueNumber} on ${owner}/${repo}`);
      const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`;
      const headers = {
        'User-Agent': 'Aider-Biographer-Bot',
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
      };

      await axios.post(url, { body }, { headers });
      console.log('PR comment posted successfully!');
    } catch (err: any) {
      console.error(`Failed to post comment to PR: ${err.message}`);
      throw new Error(`Failed to post comment to PR: ${err.message}`);
    }
  }
}
