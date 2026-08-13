import axios from 'axios';
import { GitHubService } from '../src/services/github';

// Lưu lại các hàm gốc để restore nếu cần
const originalGet = axios.get;
const originalPost = axios.post;
const originalPatch = axios.patch;

async function runTest() {
  console.log('Running GitHubService tests...');
  
  // Thiết lập token giả lập
  process.env.GITHUB_TOKEN = 'mock-token';

  const service = new GitHubService();
  
  // Test case 1: Không có comment cũ của bot -> Phải gọi POST
  console.log('\n--- Test Case 1: No existing bot comment ---');
  let postCalled = false;
  let patchCalled = false;

  axios.get = (url: string, config?: any): Promise<any> => {
    return Promise.resolve({
      data: [
        { id: 1, body: 'Some user comment' },
        { id: 2, body: 'Another user comment' }
      ]
    });
  };

  axios.post = (url: string, data?: any, config?: any): Promise<any> => {
    console.log(`Mock POST called on: ${url}`);
    if (url.includes('/issues/99/comments') && data && data.body.includes('<!-- AIDER-BOT-REVIEW-COMMENT -->')) {
      postCalled = true;
    }
    return Promise.resolve({ status: 201 });
  };

  axios.patch = (url: string, data?: any, config?: any): Promise<any> => {
    console.log(`Mock PATCH called on: ${url}`);
    patchCalled = true;
    return Promise.resolve({ status: 200 });
  };

  try {
    // Ép kiểu do TS sẽ báo lỗi nếu postOrUpdateComment chưa được khai báo (đúng chuẩn TDD: failing test)
    await (service as any).postOrUpdateComment('Tuandude', 'Aider', 99, '<!-- AIDER-BOT-REVIEW-COMMENT -->\nNew Review');
    if (postCalled && !patchCalled) {
      console.log('Test Case 1: SUCCESS (Called POST as expected)');
    } else {
      console.log(`Test Case 1: FAILED (postCalled: ${postCalled}, patchCalled: ${patchCalled})`);
    }
  } catch (err: any) {
    console.error('Test Case 1 Error:', err.message);
  }

  // Test case 2: Đã có comment cũ của bot -> Phải gọi PATCH
  console.log('\n--- Test Case 2: Existing bot comment ---');
  postCalled = false;
  patchCalled = false;

  axios.get = (url: string, config?: any): Promise<any> => {
    return Promise.resolve({
      data: [
        { id: 1, body: 'Some user comment' },
        { id: 101, body: '<!-- AIDER-BOT-REVIEW-COMMENT -->\nOld Review content' }
      ]
    });
  };

  axios.patch = (url: string, data?: any, config?: any): Promise<any> => {
    console.log(`Mock PATCH called on: ${url}`);
    if (url.includes('/comments/101') && data && data.body.includes('New Review')) {
      patchCalled = true;
    }
    return Promise.resolve({ status: 200 });
  };

  axios.post = (url: string, data?: any, config?: any): Promise<any> => {
    console.log(`Mock POST called on: ${url}`);
    postCalled = true;
    return Promise.resolve({ status: 201 });
  };

  try {
    await (service as any).postOrUpdateComment('Tuandude', 'Aider', 99, '<!-- AIDER-BOT-REVIEW-COMMENT -->\nNew Review');
    if (patchCalled && !postCalled) {
      console.log('Test Case 2: SUCCESS (Called PATCH as expected)');
    } else {
      console.log(`Test Case 2: FAILED (postCalled: ${postCalled}, patchCalled: ${patchCalled})`);
    }
  } catch (err: any) {
    console.error('Test Case 2 Error:', err.message);
  }

  // Khôi phục các hàm gốc
  axios.get = originalGet;
  axios.post = originalPost;
  axios.patch = originalPatch;
}

runTest();
