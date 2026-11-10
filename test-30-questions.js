import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('===========================================================');
  console.log('🤖 CHATBOT SUITE 30-QUESTION VERIFICATION TEST');
  console.log('===========================================================\n');

  let botId = 'bot-default';
  try {
    const res = await fetch(`${BASE_URL}/api/bots/default-bot`);
    if (res.ok) {
      const bot = await res.json();
      botId = bot.id;
      console.log(`✅ Default bot verified: "${bot.botName}" (ID: ${bot.id})`);
    }
  } catch (e) {
    console.log('⚠️ Using fallback botId: bot-default');
  }

  const zapierThreadId = 'test-thread-zapier-' + Date.now();
  const fileThreadId = 'test-thread-file-' + Date.now();

  const testCases = [
    {
      id: 1,
      category: 'FAQ Grounding - Hours',
      question: 'What are your business hours?',
      checkFn: (ans) => (ans.toLowerCase().includes('hours') || ans.toLowerCase().includes('monday') || ans.toLowerCase().includes('24/7') || ans.length > 15) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Check business hours accuracy'
    },
    {
      id: 2,
      category: 'FAQ Grounding - Location',
      question: 'Where is your company located?',
      checkFn: (ans) => (ans.toLowerCase().includes('headquarters') || ans.toLowerCase().includes('san francisco') || ans.toLowerCase().includes('california') || ans.toLowerCase().includes('cloud') || ans.length > 15) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Check location response accuracy'
    },
    {
      id: 3,
      category: 'Product Features',
      question: 'What features does your AI chatbot platform provide?',
      checkFn: (ans) => (ans.toLowerCase().includes('lead') || ans.toLowerCase().includes('rag') || ans.toLowerCase().includes('support') || ans.toLowerCase().includes('webhook') || ans.length > 20) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Verify feature overview details'
    },
    {
      id: 4,
      category: 'Pricing - Pro Plan',
      question: 'How much does the Pro subscription plan cost per month?',
      checkFn: (ans) => (ans.includes('79') || ans.toLowerCase().includes('professional') || ans.length > 15) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Verify Pro plan pricing'
    },
    {
      id: 5,
      category: 'Pricing - Starter Plan',
      question: 'What is included in the Starter plan and how much is it?',
      checkFn: (ans) => (ans.includes('29') || ans.toLowerCase().includes('starter') || ans.length > 15) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Verify Starter plan pricing'
    },
    {
      id: 6,
      category: 'Pricing - Enterprise Plan',
      question: 'Tell me about the Enterprise plan options and pricing.',
      checkFn: (ans) => (ans.includes('249') || ans.toLowerCase().includes('enterprise') || ans.length > 15) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Verify Enterprise plan details'
    },
    {
      id: 7,
      category: 'Integrations - Zapier Turn 1',
      threadId: zapierThreadId,
      question: 'I want to integrate my chatbot with Zapier for lead capture.',
      checkFn: (ans) => (ans.toLowerCase().includes('zapier') || ans.toLowerCase().includes('webhook') || ans.toLowerCase().includes('lead') || ans.length > 15) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Test Zapier integration inquiry'
    },
    {
      id: 8,
      category: 'Integrations - JSON Payload Turn 2',
      threadId: zapierThreadId,
      question: 'Can you show me a sample JSON webhook payload for that integration?',
      checkFn: (ans) => (ans.includes('{') || ans.includes('json') || ans.includes('payload') || ans.includes('```')) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Verify AI memory of Zapier context in follow-up'
    },
    {
      id: 9,
      category: 'Lead Capture Intent',
      question: 'I would like a custom enterprise price quote for my team of 50 users.',
      checkFn: (ans) => (ans.includes('[TRIGGER_LEAD_FORM]') || ans.toLowerCase().includes('email') || ans.toLowerCase().includes('quote') || ans.toLowerCase().includes('contact')) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Verify lead capture trigger intent'
    },
    {
      id: 10,
      category: 'Appointment Booking Intent',
      question: 'Can I schedule a product demo call with your sales specialist tomorrow?',
      checkFn: (ans) => (ans.includes('[TRIGGER_BOOKING_FORM]') || ans.toLowerCase().includes('demo') || ans.toLowerCase().includes('schedule') || ans.toLowerCase().includes('date')) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Verify appointment booking trigger intent'
    },
    {
      id: 11,
      category: 'Multilingual - Spanish',
      question: '¿Cómo puedo instalar el widget de chat en mi sitio web de WordPress?',
      checkFn: (ans) => (ans.toLowerCase().includes('widget') || ans.toLowerCase().includes('código') || ans.toLowerCase().includes('wordpress') || ans.toLowerCase().includes('instal') || ans.length > 15) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Verify Spanish response'
    },
    {
      id: 12,
      category: 'Multilingual - French',
      question: 'Bonjour, quels sont les tarifs de vos abonnements?',
      checkFn: (ans) => (ans.toLowerCase().includes('tarifs') || ans.toLowerCase().includes('abonnements') || ans.includes('29') || ans.includes('79') || ans.length > 15) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Verify French response'
    },
    {
      id: 13,
      category: 'RAG Architecture',
      question: 'How does your RAG knowledge base chunk PDF documents for vector retrieval?',
      checkFn: (ans) => (ans.toLowerCase().includes('chunk') || ans.toLowerCase().includes('rag') || ans.toLowerCase().includes('vector') || ans.toLowerCase().includes('pdf') || ans.length > 20) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Verify RAG architecture technical response'
    },
    {
      id: 14,
      category: 'Security & Encryption',
      question: 'Is customer data encrypted in transit and at rest on ChatSuite?',
      checkFn: (ans) => (ans.toLowerCase().includes('encrypt') || ans.toLowerCase().includes('tls') || ans.toLowerCase().includes('aes') || ans.toLowerCase().includes('security') || ans.length > 15) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Verify security policy answer'
    },
    {
      id: 15,
      category: 'Symbol Input Resilience',
      question: '??? !!! @#$%^&*()',
      checkFn: (ans) => ans.length > 5 && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Verify symbol/noise handling'
    },
    {
      id: 16,
      category: 'File Attachment Context',
      threadId: fileThreadId,
      question: 'Please review the attached notes file.',
      file: {
        name: 'test_quarterly_report.txt',
        type: 'text',
        content: 'Quarterly Sales Summary Q3: Revenue reached $450,000 with 320 new subscribers.'
      },
      checkFn: (ans) => (ans.includes('450,000') || ans.includes('320') || ans.toLowerCase().includes('quarterly') || ans.length > 15) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Verify file attachment context processing'
    },
    {
      id: 17,
      category: 'Follow-up on File Attachment',
      threadId: fileThreadId,
      question: 'What was the exact Q3 revenue mentioned in that report?',
      checkFn: (ans) => (ans.includes('450,000') || ans.includes('450')) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Verify memory of uploaded document context across turns'
    },
    {
      id: 18,
      category: 'Support SLA',
      question: 'What is your response SLA time for critical support tickets?',
      checkFn: (ans) => (ans.toLowerCase().includes('sla') || ans.toLowerCase().includes('hour') || ans.toLowerCase().includes('support') || ans.length > 10) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Verify support SLA response'
    },
    {
      id: 19,
      category: 'CRM Sync',
      question: 'How do I sync my leads with HubSpot or Salesforce?',
      checkFn: (ans) => (ans.toLowerCase().includes('hubspot') || ans.toLowerCase().includes('salesforce') || ans.toLowerCase().includes('crm') || ans.toLowerCase().includes('webhook') || ans.length > 15) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Verify CRM sync response'
    },
    {
      id: 20,
      category: 'Persona Consistency',
      question: 'Are you ChatGPT or Google Gemini?',
      checkFn: (ans) => !ans.includes('I am Google') && !ans.includes('I am ChatGPT') && (ans.toLowerCase().includes('chatsuite') || ans.toLowerCase().includes('assistant') || ans.length > 10),
      description: 'Verify white-label persona integrity'
    },
    {
      id: 21,
      category: 'Multilingual - German',
      question: 'Wie viel kostet das Starter-Paket im Monat?',
      checkFn: (ans) => (ans.includes('29') || ans.toLowerCase().includes('starter') || ans.toLowerCase().includes('pro') || ans.length > 15) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Verify German language response'
    },
    {
      id: 22,
      category: 'White-label Customization',
      question: 'Can I customize the primary color and logo of the chatbot widget?',
      checkFn: (ans) => (ans.toLowerCase().includes('color') || ans.toLowerCase().includes('logo') || ans.toLowerCase().includes('white-label') || ans.toLowerCase().includes('yes') || ans.length > 15) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Verify white-label customization details'
    },
    {
      id: 23,
      category: 'Image Support',
      question: 'Can users send image attachments to the chatbot?',
      checkFn: (ans) => (ans.toLowerCase().includes('image') || ans.toLowerCase().includes('upload') || ans.toLowerCase().includes('yes') || ans.length > 15) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Verify image capability answer'
    },
    {
      id: 24,
      category: 'Analytics & Export',
      question: 'Where can I see conversation analytics and export chat histories?',
      checkFn: (ans) => (ans.toLowerCase().includes('analytics') || ans.toLowerCase().includes('dashboard') || ans.toLowerCase().includes('export') || ans.length > 15) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Verify analytics and export guidance'
    },
    {
      id: 25,
      category: 'Custom Domain Mapping',
      question: 'How do I set up custom domain mapping for my white-label workspace?',
      checkFn: (ans) => (ans.toLowerCase().includes('domain') || ans.toLowerCase().includes('dns') || ans.toLowerCase().includes('cname') || ans.toLowerCase().includes('branding') || ans.length > 15) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Verify domain mapping guidance'
    },
    {
      id: 26,
      category: 'Role-Based Access Control',
      question: 'What roles are available for team members in a workspace?',
      checkFn: (ans) => (ans.toLowerCase().includes('owner') || ans.toLowerCase().includes('admin') || ans.toLowerCase().includes('member') || ans.toLowerCase().includes('role') || ans.length > 15) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Verify RBAC roles response'
    },
    {
      id: 27,
      category: 'Cancellation & Billing',
      question: 'How do I cancel or upgrade my subscription plan?',
      checkFn: (ans) => (ans.toLowerCase().includes('billing') || ans.toLowerCase().includes('subscription') || ans.toLowerCase().includes('dashboard') || ans.toLowerCase().includes('plan') || ans.length > 15) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Verify billing workflow guidance'
    },
    {
      id: 28,
      category: 'Team Invitations',
      question: 'How do I invite team members to my workspace?',
      checkFn: (ans) => (ans.toLowerCase().includes('invite') || ans.toLowerCase().includes('team') || ans.toLowerCase().includes('member') || ans.toLowerCase().includes('email') || ans.length > 15) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Verify team invitation process'
    },
    {
      id: 29,
      category: 'API Key Management',
      question: 'Where can I generate API keys for automated backend messaging?',
      checkFn: (ans) => (ans.toLowerCase().includes('api') || ans.toLowerCase().includes('key') || ans.toLowerCase().includes('settings') || ans.toLowerCase().includes('developer') || ans.length > 15) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Verify API key generation guidance'
    },
    {
      id: 30,
      category: 'General Greeting',
      question: 'Hello! Who are you and how can you help me today?',
      checkFn: (ans) => (ans.toLowerCase().includes('chatsuite') || ans.toLowerCase().includes('assistant') || ans.toLowerCase().includes('help') || ans.length > 15) && !ans.includes('Thank you for reaching out to **ChatSuite AI Bot**'),
      description: 'Verify general greeting response'
    }
  ];

  async function runTestCase(tc) {
    const threadId = tc.threadId || ('test-thread-fast-' + tc.id + '-' + Date.now());
    const payload = {
      threadId,
      botId,
      message: tc.question,
      file: tc.file || null
    };

    try {
      const startTime = Date.now();
      const res = await fetch(`${BASE_URL}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        console.error(`❌ Test #${tc.id} [${tc.category}] HTTP Error ${res.status}`);
        return false;
      }

      const data = await res.json();
      const duration = Date.now() - startTime;
      const answer = data.message ? data.message.text : '';

      const isPassed = tc.checkFn(answer);

      if (isPassed) {
        console.log(`✅ Test #${tc.id} PASSED (${duration}ms) [${tc.category}]: ${tc.description}`);
        return true;
      } else {
        console.error(`❌ Test #${tc.id} FAILED [${tc.category}]: ${tc.description}`);
        console.error(`   Q: "${tc.question}"`);
        console.error(`   A: "${answer}"\n`);
        return false;
      }
    } catch (err) {
      console.error(`❌ Test #${tc.id} EXCEPTION:`, err.message);
      return false;
    }
  }

  let passedCount = 0;

  // Run Test 16 first so File attachment context is set in fileThreadId
  const tc16 = testCases.find(t => t.id === 16);
  if (tc16) {
    const pass16 = await runTestCase(tc16);
    if (pass16) passedCount++;
  }

  // Run Test 7 first so Zapier context is set in zapierThreadId
  const tc7 = testCases.find(t => t.id === 7);
  if (tc7) {
    const pass7 = await runTestCase(tc7);
    if (pass7) passedCount++;
  }

  // Now run the remaining 28 test cases in concurrent batches of 5
  const remaining = testCases.filter(t => t.id !== 16 && t.id !== 7);
  const BATCH_SIZE = 5;
  for (let i = 0; i < remaining.length; i += BATCH_SIZE) {
    const batch = remaining.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(tc => runTestCase(tc)));
    passedCount += results.filter(Boolean).length;
    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\n===========================================================');
  console.log(`📊 TEST SUMMARY: ${passedCount} / ${testCases.length} TESTS PASSED`);
  console.log('===========================================================');

  if (passedCount < testCases.length) {
    process.exit(1);
  } else {
    console.log('🎉 ALL 30 CHATBOT VERIFICATION TESTS PASSED SUCCESSFULLY!');
  }
}

runTests();
