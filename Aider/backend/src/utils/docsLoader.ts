import fs from 'fs';
import path from 'path';

/**
 * Quét đệ quy thư mục và trả về danh sách đường dẫn tuyệt đối của các file markdown
 */
async function getMarkdownFiles(dir: string): Promise<string[]> {
  let results: string[] = [];
  try {
    const list = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const file of list) {
      const res = path.resolve(dir, file.name);
      if (file.isDirectory()) {
        // Bỏ qua thư mục chứa plan/spec của agent (superpowers) và các thư mục ẩn (bắt đầu bằng dấu chấm)
        if (file.name === 'superpowers' || file.name.startsWith('.')) {
          continue;
        }
        results = results.concat(await getMarkdownFiles(res));
      } else if (file.isFile() && file.name.endsWith('.md')) {
        results.push(res);
      }
    }
  } catch (err) {
    console.warn(`[DocsLoader Warning] Failed to read directory ${dir}:`, err);
  }
  return results;
}

/**
 * Đọc tất cả các file markdown trong thư mục chỉ định và gộp nội dung
 */
export async function loadProjectDocs(docsDirPath: string): Promise<string> {
  if (!fs.existsSync(docsDirPath)) {
    console.warn(`[DocsLoader Warning] Docs directory does not exist: ${docsDirPath}`);
    return '';
  }

  const files = await getMarkdownFiles(docsDirPath);
  let combinedContent = '';

  for (const file of files) {
    try {
      const relativePath = path.relative(docsDirPath, file);
      const content = await fs.promises.readFile(file, 'utf8');
      combinedContent += `\n\n--- Document: ${relativePath} ---\n${content}\n`;
    } catch (err: any) {
      console.warn(`[DocsLoader Warning] Failed to read file ${file}: ${err.message}`);
    }
  }

  return combinedContent.trim();
}
