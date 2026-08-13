import axios from 'axios';
import crypto from 'crypto';

function computeSignature(payload: string, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  return 'sha256=' + hmac.update(payload).digest('hex');
}

async function runTests() {
  const url = 'http://localhost:8085/api/webhook/github';
  const payload = {
    action: 'opened',
    pull_request: {
      number: 99,
      diff_url: 'https://raw.githubusercontent.com/Tuandude/Aider/main/README.md',
      head: {
        sha: '7e1332fa1aa784f1dc9aa02938eae2760985a8fc'
      }
    },
    repository: {
      name: 'Aider',
      owner: {
        login: 'Tuandude'
      }
    }
  };

  const payloadString = JSON.stringify(payload);
  const secret = 'my-webhook-secret';

  console.log('=== TEST 1: Sending request WITHOUT signature ===');
  try {
    const response = await axios.post(url, payload, {
      headers: {
        'x-github-event': 'pull_request',
        'Content-Type': 'application/json'
      }
    });
    console.log('Test 1 Response:', response.status, response.data);
  } catch (error: any) {
    console.log('Test 1 failed as expected/unexpected:', error.response?.status, error.response?.data);
  }

  console.log('\n=== TEST 2: Sending request with INVALID signature ===');
  try {
    const response = await axios.post(url, payload, {
      headers: {
        'x-github-event': 'pull_request',
        'Content-Type': 'application/json',
        'x-hub-signature-256': 'sha256=invalid-signature-value-here'
      }
    });
    console.log('Test 2 Response:', response.status, response.data);
  } catch (error: any) {
    console.log('Test 2 failed as expected/unexpected:', error.response?.status, error.response?.data);
  }

  console.log('\n=== TEST 3: Sending request with VALID signature ===');
  const validSignature = computeSignature(payloadString, secret);
  try {
    const response = await axios.post(url, payload, {
      headers: {
        'x-github-event': 'pull_request',
        'Content-Type': 'application/json',
        'x-hub-signature-256': validSignature
      }
    });
    console.log('Test 3 Response:', response.status, response.data);
  } catch (error: any) {
    console.log('Test 3 failed:', error.response?.status, error.response?.data);
  }
}

runTests();
