import fs from 'fs';
import path from 'path';
import { Firestore } from '@google-cloud/firestore';

export interface ReviewRecord {
  id: string; // PR number + timestamp
  prNumber: number;
  author: string;
  title: string;
  decision: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT';
  feedback: string;
  timestamp: string;
  changedFilesCount: number;
}

export class StorageService {
  private filePath: string;
  private db: Firestore | null = null;
  private useFirestore: boolean = false;

  constructor() {
    // Đường dẫn file local dự phòng
    this.filePath = path.resolve(__dirname, '../../../data/reviews_history.json');
    
    const dbType = process.env.DATABASE_TYPE || 'json';
    if (dbType === 'firestore') {
      try {
        // Khởi tạo Firestore, tự động dùng GOOGLE_APPLICATION_CREDENTIALS hoặc Project ID từ môi trường
        this.db = new Firestore();
        this.useFirestore = true;
        console.log('StorageService: Firestore client initialized.');
      } catch (err: any) {
        console.error(`StorageService: Failed to initialize Firestore: ${err.message}. Falling back to JSON file.`);
        this.useFirestore = false;
      }
    }

    // Luôn đảm bảo thư mục local exists để dự phòng (fallback)
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf8');
    }
  }

  /**
   * Lưu một bản ghi review mới vào lịch sử
   */
  async saveReview(record: Omit<ReviewRecord, 'id' | 'timestamp'>): Promise<ReviewRecord> {
    const docId = `${record.prNumber}-${Date.now()}`;
    const newRecord: ReviewRecord = {
      ...record,
      id: docId,
      timestamp: new Date().toISOString()
    };

    if (this.useFirestore && this.db) {
      try {
        await this.db.collection('reviews_history').doc(docId).set(newRecord);
        console.log(`Saved review record for PR #${record.prNumber} in Firestore.`);
        return newRecord;
      } catch (err: any) {
        console.warn(`[Storage Warning] Failed to save to Firestore: ${err.message}. Falling back to local JSON...`);
      }
    }

    // Fallback sang JSON cục bộ
    try {
      const dataStr = await fs.promises.readFile(this.filePath, 'utf8');
      const records: ReviewRecord[] = JSON.parse(dataStr);

      records.push(newRecord);
      await fs.promises.writeFile(this.filePath, JSON.stringify(records, null, 2), 'utf8');
      console.log(`Saved review record for PR #${record.prNumber} in local JSON history.`);
      return newRecord;
    } catch (err: any) {
      console.error(`Failed to save review in local storage: ${err.message}`);
      throw err;
    }
  }

  /**
   * Lấy toàn bộ danh sách lịch sử review
   */
  async getReviews(): Promise<ReviewRecord[]> {
    if (this.useFirestore && this.db) {
      try {
        const snapshot = await this.db.collection('reviews_history').orderBy('timestamp', 'asc').get();
        const records: ReviewRecord[] = [];
        snapshot.forEach(doc => {
          records.push(doc.data() as ReviewRecord);
        });
        return records;
      } catch (err: any) {
        console.warn(`[Storage Warning] Failed to load from Firestore: ${err.message}. Falling back to local JSON...`);
      }
    }

    // Fallback sang JSON cục bộ
    try {
      const dataStr = await fs.promises.readFile(this.filePath, 'utf8');
      return JSON.parse(dataStr) as ReviewRecord[];
    } catch (err: any) {
      console.error(`Failed to load reviews from local storage: ${err.message}`);
      return [];
    }
  }

  /**
   * Tính toán và thống kê hiệu suất dev cũng như báo cáo ngày/tuần
   */
  async getSummaryReports(): Promise<any> {
    const reviews = await this.getReviews();
    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneWeekMs = 7 * oneDayMs;

    // Lọc theo thời gian
    const dailyReviews = reviews.filter(r => (now.getTime() - new Date(r.timestamp).getTime()) <= oneDayMs);
    const weeklyReviews = reviews.filter(r => (now.getTime() - new Date(r.timestamp).getTime()) <= oneWeekMs);

    // Tính toán thống kê chung
    const totalReviews = reviews.length;
    const approveCount = reviews.filter(r => r.decision === 'APPROVE').length;
    const requestChangesCount = reviews.filter(r => r.decision === 'REQUEST_CHANGES').length;
    const commentCount = reviews.filter(r => r.decision === 'COMMENT').length;

    // Đánh giá hiệu suất lập trình viên (Developer Performance Metrics)
    const devMetrics: Record<string, {
      name: string;
      totalPRs: number;
      approvedPRs: number;
      requestedChangesPRs: number;
      commentedPRs: number;
      avgFilesChanged: number;
      successRate: number; // Tỷ lệ approve ngay lần đầu/tổng PR
    }> = {};

    for (const r of reviews) {
      if (!devMetrics[r.author]) {
        devMetrics[r.author] = {
          name: r.author,
          totalPRs: 0,
          approvedPRs: 0,
          requestedChangesPRs: 0,
          commentedPRs: 0,
          avgFilesChanged: 0,
          successRate: 0
        };
      }

      const metrics = devMetrics[r.author];
      metrics.totalPRs += 1;
      if (r.decision === 'APPROVE') metrics.approvedPRs += 1;
      else if (r.decision === 'REQUEST_CHANGES') metrics.requestedChangesPRs += 1;
      else metrics.commentedPRs += 1;

      // Cộng dồn để tính trung bình sau
      metrics.avgFilesChanged += r.changedFilesCount;
    }

    // Tính trung bình và tỉ lệ thành công
    const devList = Object.values(devMetrics).map(dev => {
      dev.avgFilesChanged = dev.totalPRs > 0 ? Math.round((dev.avgFilesChanged / dev.totalPRs) * 10) / 10 : 0;
      dev.successRate = dev.totalPRs > 0 ? Math.round((dev.approvedPRs / dev.totalPRs) * 100) : 0;
      return dev;
    });

    return {
      stats: {
        totalReviews,
        approveCount,
        requestChangesCount,
        commentCount,
        dailyCount: dailyReviews.length,
        weeklyCount: weeklyReviews.length
      },
      developers: devList,
      dailyReport: dailyReviews.map(r => ({
        prNumber: r.prNumber,
        author: r.author,
        title: r.title,
        decision: r.decision,
        timestamp: r.timestamp
      })),
      weeklyReport: weeklyReviews.map(r => ({
        prNumber: r.prNumber,
        author: r.author,
        title: r.title,
        decision: r.decision,
        timestamp: r.timestamp
      }))
    };
  }
}
