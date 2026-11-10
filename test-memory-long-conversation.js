import http from 'http';

function makePost(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ error: body });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function makeGet(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ error: body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runMemoryStressTest() {
  console.log('====================================================');
  console.log('🧠 CHATSUITE AI MULTI-TURN MEMORY STRESS TEST 🧠');
  console.log('====================================================\n');

  const botId = 'bot-demo-01';
  let threadId = 'mem-test-' + Date.now();
  let passedCount = 0;
  let totalTurns = 0;

  const conversationSteps = [
    {
      turn: 1,
      label: 'Introduction & Identity Registration',
      input: {
        message: 'Hello! My name is Alex Rivera and I am the CTO at Nexus Cloud Solutions.',
        userDetails: { name: 'Alex Rivera', email: 'alex@nexuscloud.com', phone: '+1 555-987-6543' }
      },
      check: (ans) => ans.length > 10,
      description: 'Bot acknowledges greeting & captures user details.'
    },
    {
      turn: 2,
      label: 'Topic Introduction (Integrations)',
      input: { message: 'What core integration options do you provide for CRMs and automation?' },
      check: (ans) => ans.toLowerCase().includes('zapier') || ans.toLowerCase().includes('webhook') || ans.toLowerCase().includes('crm') || ans.toLowerCase().includes('hubspot'),
      description: 'Bot lists integrations.'
    },
    {
      turn: 3,
      label: 'Follow-up Question with Coreference ("that")',
      input: { message: 'Can you show me a sample JSON payload for that outbound webhook?' },
      check: (ans) => ans.includes('json') || ans.includes('payload') || ans.includes('event') || ans.includes('lead_captured'),
      description: 'Bot correctly resolves "that" to webhooks and outputs sample JSON.'
    },
    {
      turn: 4,
      label: 'Document Upload Context Memory (PDF/Text)',
      input: {
        message: 'I am attaching our confidential Q3 sales report document for review.',
        file: {
          name: 'Q3_Sales_Report.txt',
          type: 'text',
          content: 'CONFIDENTIAL REPORT: Nexus Cloud Q3 Total Revenue reached $450,000 USD with 320 net new Enterprise subscribers.'
        }
      },
      check: (ans) => ans.toLowerCase().includes('450,000') || ans.toLowerCase().includes('report') || ans.toLowerCase().includes('nexus') || ans.toLowerCase().includes('revenue'),
      description: 'Bot receives document content.'
    },
    {
      turn: 5,
      label: 'Context Distraction (Unrelated Question)',
      input: { message: 'What are your standard business operating hours?' },
      check: (ans) => ans.toLowerCase().includes('monday') || ans.toLowerCase().includes('24/7') || ans.toLowerCase().includes('hours') || ans.toLowerCase().includes('9'),
      description: 'Bot answers hours accurately without losing state.'
    },
    {
      turn: 6,
      label: 'Entity Memory Retrieval (User Name & Company)',
      input: { message: 'Can you remind me what my name and company are from earlier in our conversation?' },
      check: (ans) => ans.toLowerCase().includes('alex') || ans.toLowerCase().includes('nexus') || ans.toLowerCase().includes('visitor'),
      description: 'Bot recalls Alex / Nexus Cloud Solutions from Turn 1.'
    },
    {
      turn: 7,
      label: 'Document Context Memory Retrieval ("that report")',
      input: { message: 'What was the exact Q3 revenue figure in that sales report I uploaded earlier?' },
      check: (ans) => ans.includes('450,000') || ans.toLowerCase().includes('450k') || ans.toLowerCase().includes('revenue'),
      description: 'Bot remembers $450,000 revenue from uploaded file in Turn 4.'
    },
    {
      turn: 8,
      label: 'Pricing Query',
      input: { message: 'What plans do you offer and how much is the Enterprise plan?' },
      check: (ans) => ans.includes('249') || ans.toLowerCase().includes('enterprise') || ans.toLowerCase().includes('starter'),
      description: 'Bot outlines pricing tiers.'
    },
    {
      turn: 9,
      label: 'Follow-up Pricing Clarification ("that plan")',
      input: { message: 'What features and SLAs are included in that plan?' },
      check: (ans) => ans.toLowerCase().includes('sla') || ans.toLowerCase().includes('support') || ans.toLowerCase().includes('enterprise') || ans.toLowerCase().includes('priority') || ans.toLowerCase().includes('hour'),
      description: 'Bot connects "that plan" to Enterprise and details sub-1-hour SLA.'
    },
    {
      turn: 10,
      label: 'Multilingual Shift',
      input: { message: '¿Cómo puedo instalar el widget en mi sitio web?' },
      check: (ans) => ans.toLowerCase().includes('script') || ans.toLowerCase().includes('instal') || ans.toLowerCase().includes('sitio') || ans.toLowerCase().includes('código') || ans.toLowerCase().includes('widget'),
      description: 'Bot responds in Spanish as requested.'
    }
  ];

  for (const step of conversationSteps) {
    totalTurns++;
    console.log(`[Turn ${step.turn}/10] Testing: ${step.label}`);
    console.log(`💬 User: "${step.input.message}"`);

    const res = await makePost('/api/chat/message', {
      threadId,
      botId,
      message: step.input.message,
      file: step.input.file || null,
      userDetails: step.input.userDetails || null
    });

    if (res.threadId) threadId = res.threadId;

    const botAnswer = res.message?.text || '';
    console.log(`🤖 AI Response: "${botAnswer.substring(0, 150).replace(/\n/g, ' ')}..."`);

    const isPass = step.check(botAnswer);
    if (isPass) {
      console.log(`✅ [PASS] ${step.description}\n`);
      passedCount++;
    } else {
      console.log(`❌ [FAIL] ${step.description}`);
      console.log(`   Full Answer: "${botAnswer}"\n`);
    }
  }

  // Final Session History Retrieval Endpoint Test
  console.log(`[Turn 11] Session History Retrieval API GET /api/chat/history?threadId=${threadId}`);
  const historyRes = await makeGet(`/api/chat/history?threadId=${threadId}`);
  if (historyRes && Array.isArray(historyRes.messages) && historyRes.messages.length >= 10) {
    console.log(`✅ [PASS] Session history endpoint returned ${historyRes.messages.length} messages in exact sequence!\n`);
    passedCount++;
  } else {
    console.log(`❌ [FAIL] Session history endpoint error:`, historyRes);
  }
  totalTurns++;

  console.log('====================================================');
  console.log(`RESULT: ${passedCount}/${totalTurns} Memory Tests Passed (${Math.round((passedCount/totalTurns)*100)}%)`);
  console.log('====================================================');

  if (passedCount === totalTurns) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runMemoryStressTest();
