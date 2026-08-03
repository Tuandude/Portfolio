#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import axios from 'axios';

const program = new Command();

program
  .name('aider')
  .description('Aider - The Interactive Project Biographer')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize Aider hook in the repository')
  .action(() => {
    const gitDir = path.join(process.cwd(), '.git');
    if (!fs.existsSync(gitDir)) {
      console.error('Error: Not a git repository.');
      process.exit(1);
    }

    const hooksDir = path.join(gitDir, 'hooks');
    if (!fs.existsSync(hooksDir)) {
      fs.mkdirSync(hooksDir, { recursive: true });
    }

    const hookPath = path.join(hooksDir, 'prepare-commit-msg');
    const hookScript = `#!/bin/sh
# Aider commit msg hook
node "${path.join(process.cwd(), 'cli', 'dist', 'index.js')}" run-hook "$1" "$2" "$3"
`;

    fs.writeFileSync(hookPath, hookScript, { mode: 0o755 });
    console.log('Created prepare-commit-msg Git hook.');

    const readmePath = path.join(process.cwd(), 'README.md');
    if (fs.existsSync(readmePath)) {
      let content = fs.readFileSync(readmePath, 'utf8');
      if (!content.includes('AIDER:START')) {
        content += '\n\n<!-- AIDER:START -->\n<!-- AIDER:END -->\n';
        fs.writeFileSync(readmePath, content, 'utf8');
        console.log('Added placeholders to README.md.');
      }
    } else {
      fs.writeFileSync(readmePath, '# Project\n\n<!-- AIDER:START -->\n<!-- AIDER:END -->\n', 'utf8');
      console.log('Created README.md with placeholders.');
    }
    console.log('Aider initialized successfully!');
  });

program
  .command('run-hook <commitMsgFile>')
  .description('Internal execution of the git hook')
  .action(async (commitMsgFile) => {
    try {
      const diff = execSync('git diff --cached').toString('utf8');
      if (!diff.trim()) {
        process.exit(0); // No staged changes, skip hook
      }

      const fileTree = execSync('git ls-files').toString('utf8');
      
      const readmePath = path.join(process.cwd(), 'README.md');
      let currentMermaid = '';
      if (fs.existsSync(readmePath)) {
        const readme = fs.readFileSync(readmePath, 'utf8');
        const match = readme.match(/<!-- AIDER:START -->([\s\S]*?)<!-- AIDER:END -->/);
        if (match) {
          currentMermaid = match[1].trim();
        }
      }

      console.log('Analyzing diff with Aider API...');
      const apiUrl = process.env.AIDER_API_URL || 'http://localhost:8085/api/commit';
      
      const response = await axios.post(apiUrl, {
        diff,
        fileTree,
        currentMermaid,
        projectToken: process.env.AIDER_PROJECT_TOKEN || 'default-project'
      }, { timeout: 5000 });

      const { commitMessage, updatedMermaid } = response.data;

      // Overwrite commit message file
      fs.writeFileSync(commitMsgFile, commitMessage, 'utf8');

      // Overwrite README.md diagram
      if (fs.existsSync(readmePath)) {
        let readme = fs.readFileSync(readmePath, 'utf8');
        const updatedReadme = readme.replace(
          /<!-- AIDER:START -->[\s\S]*?<!-- AIDER:END -->/,
          `<!-- AIDER:START -->\n\`\`\`mermaid\n${updatedMermaid}\n\`\`\`\n<!-- AIDER:END -->`
        );
        fs.writeFileSync(readmePath, updatedReadme, 'utf8');
        // Stage README changes automatically
        execSync('git add README.md');
      }

      console.log('Aider updated successfully!');
    } catch (err: any) {
      console.error('Aider failed:', err.message);
      // Do not crash the commit process, log and continue
    }
  });

program.parse(process.argv);
