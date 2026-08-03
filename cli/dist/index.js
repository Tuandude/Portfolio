#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const axios_1 = __importDefault(require("axios"));
const program = new commander_1.Command();
program
    .name('aider')
    .description('Aider - The Interactive Project Biographer')
    .version('1.0.0');
program
    .command('init')
    .description('Initialize Aider hook in the repository')
    .action(() => {
    const gitDir = path_1.default.join(process.cwd(), '.git');
    if (!fs_1.default.existsSync(gitDir)) {
        console.error('Error: Not a git repository.');
        process.exit(1);
    }
    const hooksDir = path_1.default.join(gitDir, 'hooks');
    if (!fs_1.default.existsSync(hooksDir)) {
        fs_1.default.mkdirSync(hooksDir, { recursive: true });
    }
    const hookPath = path_1.default.join(hooksDir, 'prepare-commit-msg');
    const hookScript = `#!/bin/sh
# Aider commit msg hook
node "${path_1.default.join(process.cwd(), 'cli', 'dist', 'index.js')}" run-hook "$1" "$2" "$3"
`;
    fs_1.default.writeFileSync(hookPath, hookScript, { mode: 0o755 });
    console.log('Created prepare-commit-msg Git hook.');
    const readmePath = path_1.default.join(process.cwd(), 'README.md');
    if (fs_1.default.existsSync(readmePath)) {
        let content = fs_1.default.readFileSync(readmePath, 'utf8');
        if (!content.includes('AIDER:START')) {
            content += '\n\n<!-- AIDER:START -->\n<!-- AIDER:END -->\n';
            fs_1.default.writeFileSync(readmePath, content, 'utf8');
            console.log('Added placeholders to README.md.');
        }
    }
    else {
        fs_1.default.writeFileSync(readmePath, '# Project\n\n<!-- AIDER:START -->\n<!-- AIDER:END -->\n', 'utf8');
        console.log('Created README.md with placeholders.');
    }
    console.log('Aider initialized successfully!');
});
program
    .command('run-hook <commitMsgFile>')
    .option('-d, --diff <range>', 'Git diff range (e.g. HEAD~1 or cached)', 'cached')
    .description('Internal execution of the git hook')
    .action(async (commitMsgFile, options) => {
    try {
        const diffCmd = options.diff === 'cached' ? 'git diff --cached' : `git diff ${options.diff}`;
        const diff = (0, child_process_1.execSync)(diffCmd).toString('utf8');
        if (!diff.trim()) {
            process.exit(0); // No changes, skip hook
        }
        const fileTree = (0, child_process_1.execSync)('git ls-files').toString('utf8');
        const readmePath = path_1.default.join(process.cwd(), 'README.md');
        let currentMermaid = '';
        if (fs_1.default.existsSync(readmePath)) {
            const readme = fs_1.default.readFileSync(readmePath, 'utf8');
            const match = readme.match(/<!-- AIDER:START -->([\s\S]*?)<!-- AIDER:END -->/);
            if (match) {
                currentMermaid = match[1].replace(/```mermaid/g, '').replace(/```/g, '').trim();
            }
        }
        console.log('Analyzing diff with Aider API...');
        const apiUrl = process.env.AIDER_API_URL || 'https://aider-backend-1047791816785.us-central1.run.app/api/commit';
        const response = await axios_1.default.post(apiUrl, {
            diff,
            fileTree,
            currentMermaid,
            projectToken: process.env.AIDER_PROJECT_TOKEN || 'default-project'
        }, { timeout: 5000 });
        const { commitMessage, updatedMermaid } = response.data;
        // Overwrite commit message file
        fs_1.default.writeFileSync(commitMsgFile, commitMessage, 'utf8');
        // Overwrite README.md diagram
        if (fs_1.default.existsSync(readmePath)) {
            let readme = fs_1.default.readFileSync(readmePath, 'utf8');
            const updatedReadme = readme.replace(/<!-- AIDER:START -->[\s\S]*?<!-- AIDER:END -->/, `<!-- AIDER:START -->\n\`\`\`mermaid\n${updatedMermaid}\n\`\`\`\n<!-- AIDER:END -->`);
            fs_1.default.writeFileSync(readmePath, updatedReadme, 'utf8');
            // Stage README changes automatically
            (0, child_process_1.execSync)('git add README.md');
        }
        console.log('Aider updated successfully!');
    }
    catch (err) {
        console.error('Aider failed:', err.message);
        // Do not crash the commit process, log and continue
    }
});
program.parse(process.argv);
