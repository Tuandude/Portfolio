import axios from 'axios';
import { GitHubService } from '../src/services/github';

const originalGet = axios.get;
const originalPost = axios.post;
const originalPatch = axios.patch;

async function runTest() {
  console.log('=== Running GitHub Issue Report Tests ===');
  process.env.GITHUB_TOKEN = 'mock-token';
  const service = new GitHubService();

  const title = '📊 Báo cáo Hiệu suất Lập trình viên & Chất lượng Code (Aider Bot)';
  const bodyContent = '# Test Report\nHello World';

  // Case 1: Issue chưa tồn tại -> Gọi POST để tạo mới
  console.log('\n--- Test Case 1: Issue report does not exist ---');
  let postCalled = false;
  let patchCalled = false;

  (axios as any).get = (url: string, config?: any): Promise<any> => {
    console.log(`Mock GET called on: ${url}`);
    return Promise.resolve({ data: [] }); // Trả về danh sách rỗng (chưa có issue nào)
  };

  (axios as any).post = (url: string, data?: any, config?: any): Promise<any> => {
    console.log(`Mock POST called on: ${url}`);
    if (url.includes('/issues') && data && data.title === title && data.body === bodyContent) {
      postCalled = true;
    }
    return Promise.resolve({ status: 201, data: { number: 45 } });
  };

  (axios as any).patch = (url: string, data?: any, config?: any) => {
    patchCalled = true;
    return Promise.resolve({ status: 200 });
  };

  try {
    await service.postOrUpdateIssueReport('Tuandude', 'Aider', bodyContent);
    if (postCalled && !patchCalled) {
      console.log('Test Case 1: SUCCESS (Created new Issue Report)');
    } else {
      console.log(`Test Case 1: FAILED (postCalled: ${postCalled}, patchCalled: ${patchCalled})`);
    }
  } catch (err: any) {
    console.error('Test Case 1 Error:', err.message);
  }

  // Case 2: Issue đã tồn tại -> Gọi PATCH để cập nhật
  console.log('\n--- Test Case 2: Issue report already exists ---');
  postCalled = false;
  patchCalled = false;

  (axios as any).get = (url: string, config?: any): Promise<any> => {
    console.log(`Mock GET called on: ${url}`);
    return Promise.resolve({ 
      data: [
        { number: 45, title: title, body: 'Old Report Content' }
      ] 
    });
  };

  (axios as any).patch = (url: string, data?: any, config?: any): Promise<any> => {
    console.log(`Mock PATCH called on: ${url}`);
    if (url.includes('/issues/45') && data && data.body === bodyContent) {
      patchCalled = true;
    }
    return Promise.resolve({ status: 200 });
  };

  (axios as any).post = (url: string, data?: any, config?: any) => {
    postCalled = true;
    return Promise.resolve({ status: 201 });
  };

  try {
    await service.postOrUpdateIssueReport('Tuandude', 'Aider', bodyContent);
    if (patchCalled && !postCalled) {
      console.log('Test Case 2: SUCCESS (Updated existing Issue Report)');
    } else {
      console.log(`Test Case 2: FAILED (postCalled: ${postCalled}, patchCalled: ${patchCalled})`);
    }
  } catch (err: any) {
    console.error('Test Case 2 Error:', err.message);
  }

  axios.get = originalGet;
  axios.post = originalPost;
  axios.patch = originalPatch;
  console.log('\n=== GitHub Issue Report Tests Completed ===');
}

runTest();
