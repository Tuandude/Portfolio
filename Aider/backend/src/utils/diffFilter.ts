/**
 * Bộ lọc diff loại bỏ các tệp không cần thiết (lockfiles, assets, build artifacts)
 */
export function filterDiff(diffContent: string): string {
  if (!diffContent) return '';
  
  const parts = diffContent.split(/^diff --git /m);
  const header = parts[0] || '';
  
  const filteredBlocks = parts.slice(1).filter(block => {
    const firstLine = block.split('\n')[0] || '';
    // Tìm a/filePath và b/filePath
    const match = firstLine.match(/a\/(.+?)\s+b\//);
    if (match) {
      const filePath = match[1].toLowerCase();
      const ignoredExtensions = [
        '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp',
        '.pdf', '.mp3', '.wav', '.mp4', '.woff', '.woff2', '.ttf', '.eot', '.zip', '.tar.gz'
      ];
      const ignoredFiles = [
        'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'composer.lock',
        'cargo.lock', 'gemfile.lock', 'dist/', 'build/', 'node_modules/', '.env'
      ];
      if (ignoredExtensions.some(ext => filePath.endsWith(ext))) {
        return false;
      }
      if (ignoredFiles.some(file => filePath.includes(file))) {
        return false;
      }
    }
    return true;
  });
  
  return [header, ...filteredBlocks.map(block => 'diff --git ' + block)].join('').trim();
}

/**
 * Giới hạn kích thước diff. Nếu vượt quá giới hạn tối đa, giữ lại cấu trúc và lược bỏ nội dung chi tiết.
 */
export function limitDiffSize(diffContent: string, maxChars = 80000): string {
  if (!diffContent || diffContent.length <= maxChars) {
    return diffContent;
  }
  
  console.log(`[Diff Filter] Diff size (${diffContent.length} chars) exceeds max limit (${maxChars} chars). Running structural truncation.`);
  
  const lines = diffContent.split('\n');
  const structuralLines: string[] = [];
  
  for (const line of lines) {
    if (line.startsWith('diff --git ')) {
      structuralLines.push(line);
    } else if (line.startsWith('--- ') || line.startsWith('+++ ') || line.startsWith('@@ ')) {
      structuralLines.push(line);
    }
  }
  
  const structuralDiff = structuralLines.join('\n');
  return `[WARNING: Git diff too large (${diffContent.length} chars) - Detailed line additions/deletions omitted to conserve context limit. Showing structural file changes only.]\n\n` + structuralDiff;
}
