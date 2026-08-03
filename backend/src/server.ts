import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/api/commit', async (req, res) => {
  const { diff, fileTree, currentMermaid, projectToken } = req.body;
  console.log(`Received commit request for token: ${projectToken}`);
  
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
