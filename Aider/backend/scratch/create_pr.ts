import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function createPR() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('Error: GITHUB_TOKEN is not configured in .env');
    process.exit(1);
  }

  const url = 'https://api.github.com/repos/Tuandude/Aider/pulls';
  const payload = {
    title: 'feat: verify clean code review for PR',
    head: 'test1',
    base: 'main',
    body: 'PR test tự động để kiểm chứng Aider Bot. Task liên quan: PROJ-123.'
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Aider-Bot-Client'
      }
    });
    console.log('PR Created Successfully!');
    console.log('PR URL:', response.data.html_url);
    console.log('PR Number:', response.data.number);
  } catch (error: any) {
    console.error('Failed to create PR:', error.response?.status, error.response?.data || error.message);
  }
}

createPR();
