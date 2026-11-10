import { MemoryManager } from '../src/lib/MemoryManager.js';

export async function runMemoryTestSuite() {
  console.log('====================================================');
  console.log('🧪 ENTERPRISE CONVERSATION MEMORY AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  const memoryMgr = new MemoryManager();
  const results: Array<{ testName: string; passed: boolean; details: string; durationMs: number }> = [];

  // ----------------------------------------------------
  // TEST 1: Long Conversation Summarization & Token Reduction
  // ----------------------------------------------------
  const start1 = Date.now();
  try {
    const ws1 = 'ws-test-enterprise-1';
    const thread1 = 'thread-long-chat-001';

    // Generate 20 turns of detailed conversation
    const messages: Array<{ role: 'user' | 'assistant'; text: string }> = [];
    messages.push({ role: 'user', text: 'Hi! My name is Sarah Jenkins and I am the VP of Ops at Apex Logistics.' });
    messages.push({ role: 'assistant', text: 'Hello Sarah! Welcome to Apex Logistics AI support.' });
    messages.push({ role: 'user', text: 'Our goal is to automate customer order tracking across 50 regional hubs.' });
    messages.push({ role: 'assistant', text: 'That sounds like a great automation goal for 50 hubs.' });
    messages.push({ role: 'user', text: 'Our tech stack is PostgreSQL, Node.js, and React with Tailwind CSS.' });
    messages.push({ role: 'assistant', text: 'Awesome stack! Node.js and PostgreSQL are ideal for our Webhook integration.' });

    // Add 14 more conversation turns
    for (let i = 1; i <= 7; i++) {
      messages.push({ role: 'user', text: `Follow-up question #${i}: How does the webhook handle high-throughput delivery for hub #${i}?` });
      messages.push({ role: 'assistant', text: `Hub #${i} webhook answer: Our queue processes up to 10,000 events/sec with retry logic.` });
    }

    // Process and summarize
    const res1 = memoryMgr.processAndSummarizeThread(ws1, thread1, messages, 6);

    const isSummarized = res1.summary.length > 0;
    const isPruned = res1.prunedMessages.length < messages.length;
    const hasTokenSavings = res1.tokenSavingsPercent > 0;
    const facts = memoryMgr.getFactsForWorkspace(ws1, thread1);
    const hasNameFact = facts.some(f => f.category === 'user_name' && f.value.includes('Sarah'));
    const hasCompanyFact = facts.some(f => f.category === 'company_name' && f.value.includes('Apex Logistics'));

    const test1Passed = isSummarized && isPruned && hasTokenSavings && hasNameFact && hasCompanyFact;
    results.push({
      testName: '1. Long Conversation Summarization & Token Usage Reduction',
      passed: test1Passed,
      details: `20 turns compressed to ${res1.prunedMessages.length} turns. Token Savings: ${res1.tokenSavingsPercent}%. Facts extracted: Name=${hasNameFact}, Company=${hasCompanyFact}.`,
      durationMs: Date.now() - start1
    });
  } catch (err: any) {
    results.push({
      testName: '1. Long Conversation Summarization',
      passed: false,
      details: `Error: ${err.message}`,
      durationMs: Date.now() - start1
    });
  }

  // ----------------------------------------------------
  // TEST 2: Memory Fact Updates & Overwrite Consistency
  // ----------------------------------------------------
  const start2 = Date.now();
  try {
    const ws2 = 'ws-test-updates-2';
    const thread2 = 'thread-updates-002';

    // Step A: Initial Fact
    memoryMgr.extractFactsFromMessage('My company name is Delta Cloud Corp.', ws2, thread2);
    const initialFacts = memoryMgr.getFactsForWorkspace(ws2, thread2);
    const initialCompany = initialFacts.find(f => f.category === 'company_name')?.value;

    // Step B: Fact Update
    memoryMgr.extractFactsFromMessage('Actually, we rebranded! Our company name is now Nova Cloud AI.', ws2, thread2);
    const updatedFacts = memoryMgr.getFactsForWorkspace(ws2, thread2);
    const companyFacts = updatedFacts.filter(f => f.category === 'company_name');
    const updatedCompany = companyFacts[0]?.value;

    const test2Passed = initialCompany === 'Delta Cloud Corp' && companyFacts.length === 1 && updatedCompany === 'Nova Cloud AI';
    results.push({
      testName: '2. Fact Memory Updates & Overwrite Logic',
      passed: test2Passed,
      details: `Initial: "${initialCompany}" -> Updated: "${updatedCompany}". Duplicate entries prevented: ${companyFacts.length === 1}.`,
      durationMs: Date.now() - start2
    });
  } catch (err: any) {
    results.push({
      testName: '2. Fact Memory Updates',
      passed: false,
      details: `Error: ${err.message}`,
      durationMs: Date.now() - start2
    });
  }

  // ----------------------------------------------------
  // TEST 3: Pre-Response Context Retrieval
  // ----------------------------------------------------
  const start3 = Date.now();
  try {
    const ws3 = 'ws-test-retrieval-3';
    const thread3 = 'thread-retrieval-003';

    memoryMgr.upsertFact({ workspaceId: ws3, threadId: thread3, category: 'user_name', key: 'user_name', value: 'Marcus Vance' });
    memoryMgr.upsertFact({ workspaceId: ws3, threadId: thread3, category: 'company_name', key: 'company_name', value: 'Vance Dynamics' });
    memoryMgr.upsertFact({ workspaceId: ws3, threadId: thread3, category: 'goals', key: 'goal_01', value: 'Achieve SOC2 Type II compliance' });

    const ctx = memoryMgr.getMemoryPromptContext(ws3, thread3);
    const containsName = ctx.contextPromptBlock.includes('Marcus Vance');
    const containsCompany = ctx.contextPromptBlock.includes('Vance Dynamics');
    const containsGoal = ctx.contextPromptBlock.includes('SOC2 Type II');

    const test3Passed = containsName && containsCompany && containsGoal;
    results.push({
      testName: '3. Pre-Response Context Retrieval & Prompt Injection',
      passed: test3Passed,
      details: `Prompt block correctly includes: Name (${containsName}), Company (${containsCompany}), Goal (${containsGoal}).`,
      durationMs: Date.now() - start3
    });
  } catch (err: any) {
    results.push({
      testName: '3. Pre-Response Context Retrieval',
      passed: false,
      details: `Error: ${err.message}`,
      durationMs: Date.now() - start3
    });
  }

  // ----------------------------------------------------
  // TEST 4: Multi-Tenant Workspace Data Isolation (Zero Leakage)
  // ----------------------------------------------------
  const start4 = Date.now();
  try {
    const wsA = 'ws-tenant-alpha';
    const threadA = 'thread-tenant-a';

    const wsB = 'ws-tenant-beta';
    const threadB = 'thread-tenant-b';

    // Tenant A sets secrets
    memoryMgr.upsertFact({ workspaceId: wsA, threadId: threadA, category: 'user_name', key: 'user_name', value: 'Alice Alpha' });
    memoryMgr.upsertFact({ workspaceId: wsA, threadId: threadA, category: 'company_name', key: 'company_name', value: 'Secret Alpha Inc' });

    // Tenant B sets secrets
    memoryMgr.upsertFact({ workspaceId: wsB, threadId: threadB, category: 'user_name', key: 'user_name', value: 'Bob Beta' });
    memoryMgr.upsertFact({ workspaceId: wsB, threadId: threadB, category: 'company_name', key: 'company_name', value: 'Confidential Beta LLC' });

    // Query Tenant B facts
    const factsB = memoryMgr.getFactsForWorkspace(wsB, threadB);
    const ctxB = memoryMgr.getMemoryPromptContext(wsB, threadB);

    const hasLeakageInFacts = factsB.some(f => f.value.includes('Alpha') || f.value.includes('Alice'));
    const hasLeakageInPrompt = ctxB.contextPromptBlock.includes('Alpha') || ctxB.contextPromptBlock.includes('Alice');

    const test4Passed = !hasLeakageInFacts && !hasLeakageInPrompt && factsB.some(f => f.value.includes('Bob Beta'));
    results.push({
      testName: '4. Multi-Tenant Workspace Data Isolation (Zero Data Leakage)',
      passed: test4Passed,
      details: `Tenant B query verified. Leakage detected: ${hasLeakageInFacts || hasLeakageInPrompt}. Tenant B isolated memory verified.`,
      durationMs: Date.now() - start4
    });
  } catch (err: any) {
    results.push({
      testName: '4. Multi-Tenant Workspace Data Isolation',
      passed: false,
      details: `Error: ${err.message}`,
      durationMs: Date.now() - start4
    });
  }

  console.log('\n--- TEST RESULTS SUMMARY ---');
  results.forEach((r, idx) => {
    console.log(`${r.passed ? '✅ PASSED' : '❌ FAILED'}: ${r.testName} (${r.durationMs}ms)`);
    console.log(`   Details: ${r.details}\n`);
  });

  const allPassed = results.every(r => r.passed);
  return {
    allPassed,
    results,
    timestamp: new Date().toISOString()
  };
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('test-memory-suite.ts')) {
  runMemoryTestSuite().then(res => {
    if (!res.allPassed) {
      process.exit(1);
    }
  });
}
