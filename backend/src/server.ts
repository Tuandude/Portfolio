import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.post('/api/commit', async (req, res) => {
  const { diff, fileTree, currentMermaid, projectToken } = req.body;
  console.log(`Received commit request for token: ${projectToken}`);

  try {
    const systemInstruction = `You are an expert system architect and technical writer. 
You will analyze a code diff and update the Mermaid diagram representing the codebase.
You must return a JSON response containing:
1. commitMessage: conventional commit format (feat/fix/chore)
2. updatedMermaid: updated graph syntax. Mark changed components.
3. pmSummary: friendly Vietnamese summary.
4. audioScript: funny 15s recap script.
Return ONLY raw JSON. No markdown ticks.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction
    });

    const prompt = `
Current Mermaid Diagram:
${currentMermaid}

Directory Structure:
${fileTree}

Git Diff:
${diff}
`;

    const response = await model.generateContent(prompt);
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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
