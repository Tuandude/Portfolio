#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .name('gitstory')
  .description('GitStory AI - The Interactive Project Biographer')
  .version('1.0.0');

import fs from 'fs';
import path from 'path';

program
  .command('init')
  .description('Initialize GitStory hook in the repository')
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
# GitStory AI commit msg hook
node "${path.join(process.cwd(), 'cli', 'dist', 'index.js')}" run-hook "$1" "$2" "$3"
`;

    fs.writeFileSync(hookPath, hookScript, { mode: 0o755 });
    console.log('Created prepare-commit-msg Git hook.');

    const readmePath = path.join(process.cwd(), 'README.md');
    if (fs.existsSync(readmePath)) {
      let content = fs.readFileSync(readmePath, 'utf8');
      if (!content.includes('GITSTORY:START')) {
        content += '\n\n<!-- GITSTORY:START -->\n<!-- GITSTORY:END -->\n';
        fs.writeFileSync(readmePath, content, 'utf8');
        console.log('Added placeholders to README.md.');
      }
    } else {
      fs.writeFileSync(readmePath, '# Project\n\n<!-- GITSTORY:START -->\n<!-- GITSTORY:END -->\n', 'utf8');
      console.log('Created README.md with placeholders.');
    }
    console.log('GitStory initialized successfully!');
  });

program.parse(process.argv);
