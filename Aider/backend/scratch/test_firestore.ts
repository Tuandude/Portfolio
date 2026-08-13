import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { StorageService } from '../src/services/storage';

dotenv.config();

async function runTest() {
  console.log('=== Running Storage Service Firestore & Fallback Tests ===');

  // Đè DATABASE_TYPE thành 'firestore' để ép StorageService thử kết nối Firestore
  process.env.DATABASE_TYPE = 'firestore';
  
  console.log('\n--- Test Case 1: Initialize StorageService under firestore mode ---');
  const storage = new StorageService();

  const mockRecord = {
    prNumber: 999,
    author: 'vity_tester',
    title: 'test: verify firestore integration',
    decision: 'APPROVE' as const,
    feedback: 'Firestore integration test record.',
    changedFilesCount: 3
  };

  console.log('\n--- Test Case 2: Attempting to save record ---');
  try {
    const saved = await storage.saveReview(mockRecord);
    console.log('Save Review Result:', saved);
    
    console.log('\n--- Test Case 3: Fetching all reviews ---');
    const reviews = await storage.getReviews();
    console.log(`Fetched ${reviews.length} reviews from current storage.`);
    const hasOurPR = reviews.some(r => r.prNumber === 999);
    if (hasOurPR) {
      console.log('SUCCESS: Found our test PR in reviews list!');
    } else {
      console.log('FAILED: Test PR not found in reviews list.');
    }

    console.log('\n--- Test Case 4: Generating performance report ---');
    const report = await storage.getSummaryReports();
    console.log('Performance report stats:', report.stats);
    console.log('Leaderboard count:', report.developers.length);

  } catch (err: any) {
    console.error('Test failed with error:', err.message);
  }

  // Dọn dẹp dữ liệu test trong file local nếu có ghi đè sang local do fallback
  const localHistoryPath = path.resolve(__dirname, '../../data/reviews_history.json');
  if (fs.existsSync(localHistoryPath)) {
    try {
      const content = fs.readFileSync(localHistoryPath, 'utf8');
      const records = JSON.parse(content);
      const filtered = records.filter((r: any) => r.prNumber !== 999);
      fs.writeFileSync(localHistoryPath, JSON.stringify(filtered, null, 2), 'utf8');
      console.log('\nCleaned up local JSON test data successfully.');
    } catch (e: any) {
      console.warn('Failed to clean up local mock data:', e.message);
    }
  }

  console.log('\n=== Storage Service Integration Tests Completed ===');
}

runTest();
