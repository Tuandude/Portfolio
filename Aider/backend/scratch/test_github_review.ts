import axios from 'axios';
import { GitHubService } from '../src/services/github';

const originalPost = axios.post;

async function runTest() {
  console.log('Running GitHub Review API tests...');
  
  process.env.GITHUB_TOKEN = 'mock-token';
  const service = new GitHubService();
  
  let reviewPostCalled = false;
  let reviewPayload: any = null;

  axios.post = (url: string, data?: any, config?: any): Promise<any> => {
    console.log(`Mock POST called on: ${url}`);
    if (url.includes('/pulls/99/reviews')) {
      reviewPostCalled = true;
      reviewPayload = data;
    }
    return Promise.resolve({ status: 200, data: { id: 555 } });
  };

  try {
    const body = '### Code Review\nEverything looks good!';
    const event = 'APPROVE';
    
    // Gọi submitReview (cast qua any để tránh lỗi build khi chưa định nghĩa hàm)
    await (service as any).submitReview('Tuandude', 'Aider', 99, body, event);
    
    if (reviewPostCalled && reviewPayload && reviewPayload.event === 'APPROVE' && reviewPayload.body === body) {
      console.log('Test Case: SUCCESS (Successfully submitted Review to GitHub)');
    } else {
      console.log('Test Case: FAILED (API not called correctly, reviewPostCalled:', reviewPostCalled, 'payload:', reviewPayload);
    }
  } catch (err: any) {
    console.error('Test Case Error:', err.message);
  }

  axios.post = originalPost;
}

runTest();
