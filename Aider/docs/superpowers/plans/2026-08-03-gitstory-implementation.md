# GitStory AI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy GitStory AI, an AI-powered project biographer that generates dynamic Mermaid architectural diagrams, conventional commits, PM release notes, and audio recaps from local git commits.

**Architecture:** A local Node.js CLI tool running as a git commit hook extracts diffs and directory structures. It posts them to a live Google Cloud Run Express.js backend, which invokes Gemini 1.5 Flash to generate responses, updates the local README, saves metadata/audio to Firestore and Cloud Storage, and syncs history with a React Web Dashboard.

**Tech Stack:** Node.js, TypeScript, Express, Tailwind CSS, React, Vite, Firebase, Google Cloud Run, Google AI Studio (Gemini 1.5 Flash).

## Global Constraints
- Target latency for hook execution: Under 5 seconds.
- All code changes must compile and pass TypeScript validation.
- All API keys must be loaded via environment variables (`GEMINI_API_KEY`, `GOOGLE_APPLICATION_CREDENTIALS`).
- Project directory structures must match Node.js TypeScript layout.

---

### Task 1: Scaffold CLI Client & Setup Build

**Files:**
- Create: `cli/package.json`
- Create: `cli/tsconfig.json`
- Create: `cli/src/index.ts`

**Interfaces:**
- CLI package exposes the executable command `gitstory`.

- [ ] **Step 1: Create package.json**
  Write to `cli/package.json`:
  ```json
  {
    "name": "gitstory-cli",
    "version": "1.0.0",
    "description": "GitStory AI CLI client",
    "main": "dist/index.js",
    "bin": {
      "gitstory": "./dist/index.js"
    },
    "scripts": {
      "build": "tsc",
      "start": "node dist/index.js"
    },
    "dependencies": {
      "axios": "^1.6.0",
      "commander": "^11.1.0",
      "dotenv": "^16.3.0"
    },
    "devDependencies": {
      "@types/node": "^20.8.0",
      "typescript": "^5.2.0"
    }
  }
  ```

- [ ] **Step 2: Create tsconfig.json**
  Write to `cli/tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "CommonJS",
      "rootDir": "./src",
      "outDir": "./dist",
      "esModuleInterop": true,
      "forceConsistentCasingInFileNames": true,
      "strict": true,
      "skipLibCheck": true
    },
    "include": ["src/**/*"]
  }
  ```

- [ ] **Step 3: Create index.ts basic structure**
  Write to `cli/src/index.ts`:
  ```typescript
  #!/usr/bin/env node
  import { Command } from 'commander';

  const program = new Command();

  program
    .name('gitstory')
    .description('GitStory AI - The Interactive Project Biographer')
    .version('1.0.0');

  program
    .command('init')
    .description('Initialize GitStory hook in the repository')
    .action(() => {
      console.log('Initializing GitStory...');
    });

  program.parse(process.argv);
  ```

- [ ] **Step 4: Build to verify compilation**
  Run: `npm install` and `npm run build` in the `cli/` directory.
  Expected: Command finishes successfully and produces `cli/dist/index.js`.

---

### Task 2: Implement Git Hook Installation (`gitstory init`)

**Files:**
- Modify: `cli/src/index.ts`

**Interfaces:**
- Command `gitstory init` creates `.git/hooks/prepare-commit-msg` and initializes `README.md` placeholder.

- [ ] **Step 1: Implement installation logic**
  Update `cli/src/index.ts`:
  ```typescript
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
npx gitstory run-hook "$1" "$2" "$3"
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
  ```

- [ ] **Step 2: Verify installer locally**
  Run: `npm run build` in `cli/`, then `node dist/index.js init` in a mock git directory.
  Expected: Hook file and README placeholders are created correctly.

---

### Task 3: Implement Hook execution logic (`gitstory run-hook`)

**Files:**
- Modify: `cli/src/index.ts`

- [ ] **Step 1: Add run-hook command**
  Add execution command to `cli/src/index.ts` to fetch git diff and update local files:
  ```typescript
  import { execSync } from 'child_process';
  import axios from 'axios';

  program
    .command('run-hook <commitMsgFile>')
    .description('Internal execution of the git hook')
    .action(async (commitMsgFile) => {
      try {
        const diff = execSync('git diff --cached').toString('utf8');
        if (!diff.trim()) {
          process.exit(0); // No staged changes, skip hook
        }

        const fileTree = execSync('git file-tree 2>/dev/null || git ls-files').toString('utf8');
        
        const readmePath = path.join(process.cwd(), 'README.md');
        let currentMermaid = '';
        if (fs.existsSync(readmePath)) {
          const readme = fs.readFileSync(readmePath, 'utf8');
          const match = readme.match(/<!-- GITSTORY:START -->([\s\S]*?)<!-- GITSTORY:END -->/);
          if (match) {
            currentMermaid = match[1].trim();
          }
        }

        console.log('Analyzing diff with GitStory API...');
        const apiUrl = process.env.GITSTORY_API_URL || 'http://localhost:8080/api/commit';
        
        const response = await axios.post(apiUrl, {
          diff,
          fileTree,
          currentMermaid,
          projectToken: process.env.GITSTORY_PROJECT_TOKEN || 'default-project'
        });

        const { commitMessage, updatedMermaid } = response.data;

        // Overwrite commit message file
        fs.writeFileSync(commitMsgFile, commitMessage, 'utf8');

        // Overwrite README.md diagram
        if (fs.existsSync(readmePath)) {
          let readme = fs.readFileSync(readmePath, 'utf8');
          const updatedReadme = readme.replace(
            /<!-- GITSTORY:START -->[\s\S]*?<!-- GITSTORY:END -->/,
            `<!-- GITSTORY:START -->\n\`\`\`mermaid\n${updatedMermaid}\n\`\`\`\n<!-- GITSTORY:END -->`
          );
          fs.writeFileSync(readmePath, updatedReadme, 'utf8');
          // Stage README changes automatically
          execSync('git add README.md');
        }

        console.log('GitStory updated successfully!');
      } catch (err: any) {
        console.error('GitStory failed:', err.message);
        // Do not crash the commit process, log and continue
      }
    });
  ```

---

### Task 4: Scaffold Backend Express Server

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/src/server.ts`
- Create: `backend/Dockerfile`

- [ ] **Step 1: Create package.json**
  Write to `backend/package.json`:
  ```json
  {
    "name": "gitstory-backend",
    "version": "1.0.0",
    "main": "dist/server.js",
    "scripts": {
      "build": "tsc",
      "start": "node dist/server.js",
      "dev": "ts-node-dev --respawn src/server.ts"
    },
    "dependencies": {
      "@google/generative-ai": "^0.1.0",
      "cors": "^2.8.5",
      "dotenv": "^16.3.0",
      "express": "^4.18.2"
    },
    "devDependencies": {
      "@types/cors": "^2.8.15",
      "@types/express": "^4.17.20",
      "@types/node": "^20.8.0",
      "ts-node-dev": "^2.0.0",
      "typescript": "^5.2.0"
    }
  }
  ```

- [ ] **Step 2: Create tsconfig.json**
  Write to `backend/tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "CommonJS",
      "rootDir": "./src",
      "outDir": "./dist",
      "esModuleInterop": true,
      "forceConsistentCasingInFileNames": true,
      "strict": true,
      "skipLibCheck": true
    },
    "include": ["src/**/*"]
  }
  ```

- [ ] **Step 3: Create server.ts Express Boilerplate**
  Write to `backend/src/server.ts`:
  ```typescript
  import express from 'express';
  import cors from 'cors';
  import dotenv from 'dotenv';

  dotenv.config();

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  app.post('/api/commit', async (req, res) => {
    const { diff, fileTree, currentMermaid, projectToken } = req.body;
    
    // Default fallback responses
    res.json({
      commitMessage: 'feat: add gitstory implementation',
      updatedMermaid: 'graph TD\n  A[App] --> B[Controller]'
    });
  });

  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
  ```

- [ ] **Step 4: Create Dockerfile**
  Write to `backend/Dockerfile`:
  ```dockerfile
  FROM node:20-slim AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm install
  COPY . .
  RUN npm run build

  FROM node:20-slim
  WORKDIR /app
  COPY package*.json ./
  RUN npm install --only=production
  COPY --from=builder /app/dist ./dist
  EXPOSE 8080
  CMD ["node", "dist/server.js"]
  ```

---

### Task 5: Integrate Gemini 1.5 Flash in Backend

**Files:**
- Modify: `backend/src/server.ts`

- [ ] **Step 1: Add Google Generative AI code**
  Implement prompt generation and parsing logic:
  ```typescript
  import { GoogleGenAI } from '@google/generative-ai';

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  app.post('/api/commit', async (req, res) => {
    const { diff, fileTree, currentMermaid } = req.body;

    try {
      const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const systemInstruction = `
      You are an expert system architect and technical writer. 
      You will analyze a code diff and update the Mermaid diagram representing the codebase.
      You must return a JSON response containing:
      1. commitMessage: conventional commit format (feat/fix/chore)
      2. updatedMermaid: updated graph syntax. Mark changed components.
      3. pmSummary: friendly Vietnamese summary.
      4. audioScript: funny 15s recap script.
      Return ONLY raw JSON. No markdown ticks.
      `;

      const prompt = `
      Current Mermaid Diagram:
      ${currentMermaid}

      Directory Structure:
      ${fileTree}

      Git Diff:
      ${diff}
      `;

      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction
      });

      const responseText = response.response.text();
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      res.json({
        commitMessage: parsed.commitMessage,
        updatedMermaid: parsed.updatedMermaid,
        pmSummary: parsed.pmSummary,
        audioScript: parsed.audioScript
      });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
  ```

---

### Task 6: Cloud Run Deployment & Live Verification

- [ ] **Step 1: Deploy backend to Cloud Run**
  Run: `gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/gitstory-backend`
  Run: `gcloud run deploy gitstory-backend --image gcr.io/YOUR_PROJECT_ID/gitstory-backend --platform managed --allow-unauthenticated --set-env-vars GEMINI_API_KEY=YOUR_API_KEY --region us-central1`
  Expected: Live service URL is printed.

- [ ] **Step 2: Verify live local execution**
  Export `GITSTORY_API_URL` to your Cloud Run URL.
  Execute a commit locally and verify the commit completes and updates `README.md` instantly.
