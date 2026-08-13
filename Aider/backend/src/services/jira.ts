import axios from 'axios';

export class JiraService {
  private domain: string;
  private email: string;
  private token: string;

  constructor() {
    this.domain = process.env.JIRA_DOMAIN || '';
    this.email = process.env.JIRA_EMAIL || '';
    this.token = process.env.JIRA_API_TOKEN || '';
  }

  /**
   * Trích xuất mã Jira ID (ví dụ: PROJ-123) từ tiêu đề hoặc mô tả PR
   */
  extractJiraIds(text: string): string[] {
    if (!text) return [];
    // Regex tìm các chuỗi dạng ABC-123, PROJ-456
    const regex = /[A-Z0-9]+-\d+/g;
    const matches = text.match(regex);
    return matches ? Array.from(new Set(matches)) : [];
  }

  /**
   * Lấy thông tin mô tả chi tiết của ticket Jira
   */
  async getJiraTicketDescription(ticketId: string): Promise<string> {
    if (!this.domain || !this.email || !this.token) {
      console.warn(`[Jira Warning] Jira configuration is missing. Cannot fetch description for ${ticketId}.`);
      return '';
    }

    try {
      console.log(`Fetching Jira ticket info for: ${ticketId}`);
      const url = `https://${this.domain}/rest/api/3/issue/${ticketId}`;
      const auth = Buffer.from(`${this.email}:${this.token}`).toString('base64');
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      });

      // Lấy mô tả từ trường fields.description
      // Đối với Jira API v3, description thường là cấu trúc ADF (Atlassian Document Format)
      // Ta có thể trích xuất văn bản thô từ ADF hoặc trả về nội dung text thô
      const fields = response.data.fields || {};
      const summary = fields.summary || '';
      
      let descriptionText = '';
      if (fields.description) {
        descriptionText = this.parseADFText(fields.description);
      }

      return `Jira Ticket: ${ticketId}\nSummary: ${summary}\nDescription: ${descriptionText}`;
    } catch (err: any) {
      console.warn(`Failed to fetch Jira ticket ${ticketId}: ${err.message}`);
      return '';
    }
  }

  /**
   * Helper đơn giản để parse văn bản thô từ Atlassian Document Format (ADF)
   */
  private parseADFText(adf: any): string {
    if (!adf) return '';
    if (typeof adf === 'string') return adf;
    
    let text = '';
    if (adf.text) {
      text += adf.text;
    }
    if (adf.content && Array.isArray(adf.content)) {
      for (const node of adf.content) {
        text += this.parseADFText(node) + ' ';
      }
    }
    return text.trim();
  }
}
