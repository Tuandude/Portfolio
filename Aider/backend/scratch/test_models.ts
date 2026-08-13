import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('No API key found in .env');
    return;
  }
  console.log('Testing with API Key:', apiKey.substring(0, 15) + '...');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const modelsToTest = [
    'gemini-3.5-flash',
    'gemini-3.0-flash',
    'gemini-3.5-pro',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest'
  ];

  for (const modelName of modelsToTest) {
    try {
      console.log(`\n--- Testing model: ${modelName} ---`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Hello, say hello in Vietnamese');
      console.log(`Success with ${modelName}! Response:`, result.response.text().trim());
    } catch (err: any) {
      console.error(`Failed for ${modelName}:`, err.message);
    }
  }
}

testModels();
