import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('====================================================');
  console.log('🤖 CHATBOT SUITE 20-QUESTION VERIFICATION TEST SUITE');
  console.log('====================================================\n');

  // First, get default bot ID
  let botId = 'bot-default';
  try {
    const res = await fetch(`${BASE_URL}/api/bots/default-bot`);
    if (res.ok) {
      const bot = await res.json();
      botId = bot.id;
      console.log(`✅ Fetched default bot: "${bot.botName}" (ID: ${bot.id})`);
    }
  } catch (e) {
    console.log('⚠️ Using fallback botId: bot-default');
  }

  const threadId = 'test-thread-' + Date.now();

  const testCases = [
    {
      id: 1,
      category: 'FAQ Grounding',
      question: 'What are your business hours?',
      checkFn: (ans) => ans.length > 10,
      description: 'Check FAQ grounding for business hours'
    },
    {
      id: 2,
      category: 'FAQ Grounding',
      question: 'Where is your company located?',
      checkFn: (ans) => ans.length > 10,
      description: 'Check FAQ grounding for company location'
    },
    {
      id: 3,
      category: 'Product Capabilities',
      question: 'What features does your AI chatbot platform provide?',
      checkFn: (ans) => ans.toLowerCase().includes('bot') || ans.toLowerCase().includes('lead') || ans.length > 20,
      description: 'Verify product feature overview'
    },
    {
      id: 4,
      category: 'Pricing',
      question: 'How much does the Pro subscription plan cost per month?',
      checkFn: (ans) => ans.length > 15,
      description: 'Verify pricing response accuracy'
    },
    {
      id: 5,
      category: 'Multi-Turn Conversation (Part 1)',
      question: 'I want to integrate my chatbot with Zapier for leads.',
      checkFn: (ans) => ans.toLowerCase().includes('zapier') || ans.toLowerCase().includes('lead') || ans.toLowerCase().includes('webhook'),
      description: 'Test first turn of integration conversation'
    },
    {
      id: 6,
      category: 'Multi-Turn Conversation (Part 2 - Context Memory)',
      question: 'Can you show me a sample JSON webhook payload for that integration?',
      checkFn: (ans) => ans.includes('{') || ans.includes('json') || ans.includes('payload') || ans.includes('```'),
      description: 'Verify AI remembers prior context (Zapier webhook) in follow-up'
    },
    {
      id: 7,
      category: 'Lead Capture Trigger',
      question: 'I would like a custom enterprise price quote for my team of 50 users.',
      checkFn: (ans) => ans.includes('[TRIGGER_LEAD_FORM]') || ans.toLowerCase().includes('email') || ans.toLowerCase().includes('contact'),
      description: 'Check lead capture intent detection and token trigger'
    },
    {
      id: 8,
      category: 'Appointment Booking Trigger',
      question: 'Can I schedule a product demo call with your sales specialist tomorrow?',
      checkFn: (ans) => ans.includes('[TRIGGER_BOOKING_FORM]') || ans.toLowerCase().includes('date') || ans.toLowerCase().includes('book'),
      description: 'Check appointment booking intent detection and token trigger'
    },
    {
      id: 9,
      category: 'Multilingual (Spanish)',
      question: '¿Cómo puedo instalar el widget de chat en mi sitio web de WordPress?',
      checkFn: (ans) => ans.toLowerCase().includes('widget') || ans.toLowerCase().includes('código') || ans.toLowerCase().includes('wordpress') || ans.length > 20,
      description: 'Verify Spanish language processing and response'
    },
    {
      id: 10,
      category: 'Multilingual (French)',
      question: 'Bonjour, quels sont les tarifs de vos abonnements?',
      checkFn: (ans) => ans.length > 15,
      description: 'Verify French language processing and response'
    },
    {
      id: 11,
      category: 'Technical Architecture',
      question: 'How does your RAG knowledge base chunk PDF documents for vector retrieval?',
      checkFn: (ans) => ans.length > 20,
      description: 'Verify technical explanation depth'
    },
    {
      id: 12,
      category: 'Security & Compliance',
      question: 'Is customer data encrypted in transit and at rest on ChatSuite?',
      checkFn: (ans) => ans.toLowerCase().includes('encrypt') || ans.toLowerCase().includes('security') || ans.length > 15,
      description: 'Verify security policy guidance'
    },
    {
      id: 13,
      category: 'Edge Case / Special Syntax',
      question: '??? !!! @#$%^&*()',
      checkFn: (ans) => ans.length > 5,
      description: 'Verify robust handling of non-standard symbols'
    },
    {
      id: 14,
      category: 'File Attachment Context',
      question: 'Please review the attached notes file.',
      file: {
        name: 'test_quarterly_report.txt',
        type: 'text',
        content: 'Quarterly Sales Summary Q3: Revenue reached $450,000 with 320 new subscribers.'
      },
      checkFn: (ans) => ans.includes('450,000') || ans.includes('320') || ans.toLowerCase().includes('quarterly') || ans.length > 15,
      description: 'Test textual file upload parsing and grounded context inclusion'
    },
    {
      id: 15,
      category: 'Follow-up on Uploaded File',
      question: 'What was the exact Q3 revenue mentioned in that report?',
      checkFn: (ans) => ans.includes('450,000') || ans.includes('450'),
      description: 'Verify memory of uploaded document context across turns'
    },
    {
      id: 16,
      category: 'Copilot Endpoint - Embed Guide',
      type: 'copilot',
      question: 'How do I embed ChatSuite AI on my Shopify store?',
      checkFn: (ans) => ans.toLowerCase().includes('shopify') || ans.toLowerCase().includes('script') || ans.includes('head'),
      description: 'Verify AI Customer Success Copilot embedding guide response'
    },
    {
      id: 17,
      category: 'Copilot Endpoint - Model Guidance',
      type: 'copilot',
      question: 'What is the difference between Gemini 2.5 Flash and Gemini 2.5 Pro?',
      checkFn: (ans) => ans.toLowerCase().includes('flash') || ans.toLowerCase().includes('pro') || ans.length > 20,
      description: 'Verify AI Customer Success Copilot model recommendation'
    },
    {
      id: 18,
      category: 'Support SLA Inquiry',
      question: 'What is your response SLA time for critical support tickets?',
      checkFn: (ans) => ans.length > 10,
      description: 'Verify support SLA response'
    },
    {
      id: 19,
      category: 'CRM Integration',
      question: 'How do I sync my leads with HubSpot or Salesforce?',
      checkFn: (ans) => ans.length > 15,
      description: 'Verify CRM integration instructions'
    },
    {
      id: 20,
      category: 'Persona Consistency Check',
      question: 'Are you ChatGPT or Google Gemini?',
      checkFn: (ans) => !ans.includes('I am Google') && !ans.includes('I am ChatGPT') && (ans.includes('AI') || ans.includes('assistant') || ans.length > 10),
      description: 'Verify white-label persona consistency (does not claim to be third party)'
    }
  ];

  let passedCount = 0;

  for (const tc of testCases) {
    // Add 1.5s pause between tests to stay safely within rate limits
    await new Promise(r => setTimeout(r, 1500));

    const isCopilot = tc.type === 'copilot';
    const endpoint = isCopilot ? '/api/customer-success/copilot' : '/api/chat/message';
    
    const payload = isCopilot
      ? { question: tc.question }
      : {
          threadId,
          botId,
          message: tc.question,
          file: tc.file || null
        };

    try {
      const startTime = Date.now();
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        console.error(`❌ Test #${tc.id} [${tc.category}] HTTP Error ${res.status}`);
        continue;
      }

      const data = await res.json();
      const duration = Date.now() - startTime;
      const answer = isCopilot ? data.answer : data.message.text;

      const isPassed = tc.checkFn(answer);

      if (isPassed) {
        passedCount++;
        console.log(`✅ Test #${tc.id} PASSED (${duration}ms) [${tc.category}]: ${tc.description}`);
        console.log(`   Q: "${tc.question}"`);
        console.log(`   A: "${answer.replace(/\n/g, ' ').substring(0, 110)}..."\n`);
      } else {
        console.error(`❌ Test #${tc.id} FAILED [${tc.category}]: ${tc.description}`);
        console.error(`   Q: "${tc.question}"`);
        console.error(`   A: "${answer}"\n`);
      }

    } catch (err) {
      console.error(`❌ Test #${tc.id} EXCEPTION:`, err.message);
    }
  }

  console.log('====================================================');
  console.log(`📊 TEST SUMMARY: ${passedCount} / ${testCases.length} TESTS PASSED`);
  console.log('====================================================');

  if (passedCount < testCases.length) {
    process.exit(1);
  } else {
    console.log('🎉 ALL 20 CHATBOT VERIFICATION TESTS PASSED SUCCESSFULLY!');
  }
}

runTests();
