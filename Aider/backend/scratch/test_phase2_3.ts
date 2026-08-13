import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { JiraService } from '../src/services/jira';
import { StorageService } from '../src/services/storage';
import { GitHubService } from '../src/services/github';

const originalPut = axios.put;

async function runTests() {
  console.log('=== Running Phase 2 & 3 Integration Tests ===');

  // 1. Kiểm thử JiraService
  console.log('\n--- 1. Testing JiraService ---');
  const jiraService = new JiraService();
  const sampleText = 'feat(auth): resolve PROJ-123 and implement ABC-999 security flow';
  const extracted = jiraService.extractJiraIds(sampleText);
  console.log('Extracted Jira IDs:', extracted);
  if (extracted.includes('PROJ-123') && extracted.includes('ABC-999') && extracted.length === 2) {
    console.log('Jira ID Extraction: SUCCESS');
  } else {
    console.log('Jira ID Extraction: FAILED');
  }

  // Gọi mô tả ticket khi không cấu hình -> Cần chạy an toàn không crash
  const desc = await jiraService.getJiraTicketDescription('PROJ-123');
  console.log('Jira Ticket Desc (No config fallback):', JSON.stringify(desc));
  console.log('Jira Fetch (No config): SUCCESS (Bypassed safely)');

  // 2. Kiểm thử StorageService
  console.log('\n--- 2. Testing StorageService ---');
  // Dọn dẹp file mock trước khi test
  const testFilePath = path.resolve(__dirname, '../../data/reviews_history.json');
  if (fs.existsSync(testFilePath)) {
    fs.unlinkSync(testFilePath);
  }

  const storageService = new StorageService();

  // Lưu record 1: APPROVE
  const record1 = await storageService.saveReview({
    prNumber: 101,
    author: 'tuan_dang',
    title: 'feat: implement payment gateway',
    decision: 'APPROVE',
    feedback: 'Code looks clean and conforms to style guidelines.',
    changedFilesCount: 5
  });

  // Lưu record 2: REQUEST_CHANGES
  const record2 = await storageService.saveReview({
    prNumber: 102,
    author: 'dev_b',
    title: 'fix: resolve memory leak in session manager',
    decision: 'REQUEST_CHANGES',
    feedback: 'Critical bug: connection pool is not released on error.',
    changedFilesCount: 12
  });

  // Lưu record 3: COMMENT
  await storageService.saveReview({
    prNumber: 103,
    author: 'tuan_dang',
    title: 'chore: update README docs',
    decision: 'COMMENT',
    feedback: 'Nice updates. Minor typo fixed.',
    changedFilesCount: 1
  });

  const list = await storageService.getReviews();
  console.log('Loaded reviews count:', list.length);
  if (list.length === 3) {
    console.log('Storage Save/Load: SUCCESS');
  } else {
    console.log('Storage Save/Load: FAILED');
  }

  // Thống kê report
  const summary = await storageService.getSummaryReports();
  console.log('Summary Stats:', summary.stats);
  console.log('Developer Performance metrics:', summary.developers);

  if (summary.stats.totalReviews === 3 &&
    summary.stats.approveCount === 1 &&
    summary.stats.requestChangesCount === 1 &&
    summary.developers.length === 2) {
    console.log('Summary Reports Computation: SUCCESS');
  } else {
    console.log('Summary Reports Computation: FAILED');
  }

  // 3. Kiểm thử Auto-Merge API
  console.log('\n--- 3. Testing GitHub Auto-Merge API ---');
  process.env.GITHUB_TOKEN = 'mock-token';
  const githubService = new GitHubService();
  let mergeCalled = false;
  let mergePayload = null;

  axios.put = (url: string, data?: any, config?: any): Promise<any> => {
    console.log(`Mock PUT called on: ${url}`);
    if (url.includes('/pulls/101/merge')) {
      mergeCalled = true;
      mergePayload = data;
    }
    return Promise.resolve({ status: 200, data: { merged: true } });
  };

  try {
    await githubService.mergePullRequest('Tuandude', 'Aider', 101);
    if (mergeCalled && mergePayload) {
      console.log('GitHub Auto-Merge: SUCCESS');
    } else {
      console.log('GitHub Auto-Merge: FAILED');
    }
  } catch (err: any) {
    console.error('GitHub Auto-Merge Error:', err.message);
  }

  axios.put = originalPut;
  console.log('\n=== Phase 2 & 3 Integration Tests Completed ===');
}

runTests();
