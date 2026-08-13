import path from 'path';
import { loadProjectDocs } from '../src/utils/docsLoader';

async function runTest() {
  console.log('Running DocsLoader tests...');
  const docsPath = path.join(__dirname, '../../docs');
  console.log(`Scanning docs path: ${docsPath}`);

  try {
    const combinedDocs = await loadProjectDocs(docsPath);
    console.log('\n--- Combined Docs Output Preview ---');
    console.log(combinedDocs.substring(0, 500) + '...');
    
    // Kiểm tra xem kết quả có chứa nội dung file self_hosting_guide.md hay không
    if (combinedDocs.includes('self_hosting_guide.md') || combinedDocs.includes('Self-Hosting') || combinedDocs.includes('self-host')) {
      console.log('\nTest Case: SUCCESS (Successfully read and combined markdown documentation)');
    } else {
      console.log('\nTest Case: FAILED (Markdown files not found or contents empty)');
    }
  } catch (err: any) {
    console.error('Test Case Error:', err.message);
  }
}

runTest();
