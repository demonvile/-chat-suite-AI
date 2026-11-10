import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function runDeleteChatbotTestSuite() {
  console.log('====================================================');
  console.log('🧪 ENTERPRISE DELETE CHATBOT FEATURE TEST SUITE');
  console.log('====================================================\n');

  try {
    // 1. Login as User A (Admin / Owner)
    console.log('🔑 Step 1: Authenticating User A (Owner)...');
    const authResA = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@platform.com', password: 'admin123' })
    });
    const authDataA = await authResA.json() as any;
    if (!authDataA.token) throw new Error(`User A auth failed: ${JSON.stringify(authDataA)}`);
    const tokenA = authDataA.token;
    console.log(`   User A authenticated. ID: ${authDataA.user.id}`);

    // 2. Register/Login as User B (Different User)
    console.log('\n🔑 Step 2: Registering User B (Unauthorized Other User)...');
    const userBEmail = `user_b_${Date.now()}@test.com`;
    const regResB = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userBEmail,
        password: 'Password123!',
        name: 'Unauthorised User B',
        companyName: 'Competitor Corp'
      })
    });
    const regDataB = await regResB.json() as any;
    if (!regDataB.token) throw new Error(`User B reg failed: ${JSON.stringify(regDataB)}`);
    const tokenB = regDataB.token;
    console.log(`   User B authenticated. ID: ${regDataB.user.id}`);

    // 3. Create a test chatbot owned by User A
    console.log('\n🤖 Step 3: Creating Test Chatbot owned by User A...');
    const botName = `Test Deletion Bot ${Date.now()}`;
    const createBotRes = await fetch(`${BASE_URL}/api/bots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        name: botName,
        botName: botName,
        welcomeMessage: 'Hello! I am a bot to test deletion.',
        systemPrompt: 'You are a test bot.',
        userId: authDataA.user.id
      })
    });
    const testBot = await createBotRes.json() as any;
    if (!testBot.id) throw new Error(`Failed to create test chatbot: ${JSON.stringify(testBot)}`);
    console.log(`   Created chatbot "${testBot.name}" (ID: ${testBot.id}, API Key: ${testBot.apiKey})`);

    // 4. Test Authorization Security: User B tries to delete User A's chatbot
    console.log('\n🛡️ Step 4: Security Check - User B attempts to delete User A\'s chatbot...');
    const unauthorizedDeleteRes = await fetch(`${BASE_URL}/api/bots/${testBot.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const unauthorizedData = await unauthorizedDeleteRes.json() as any;
    console.log(`   HTTP Status: ${unauthorizedDeleteRes.status}`);
    console.log(`   Response: ${JSON.stringify(unauthorizedData)}`);
    if (unauthorizedDeleteRes.status !== 403) {
      throw new Error('SECURITY BREACH: Unauthorized user was able to delete someone else\'s chatbot!');
    }
    console.log('   ✅ PASSED: Unauthorized deletion attempt blocked with HTTP 403 Forbidden.');

    // 5. User A Soft-deletes the Chatbot
    console.log('\n🗑️ Step 5: User A soft-deletes the chatbot...');
    const softDeleteRes = await fetch(`${BASE_URL}/api/bots/${testBot.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const softDeleteData = await softDeleteRes.json() as any;
    console.log(`   HTTP Status: ${softDeleteRes.status}`);
    console.log(`   Response: ${JSON.stringify(softDeleteData)}`);
    if (!softDeleteRes.ok || !softDeleteData.success) {
      throw new Error('Soft delete failed for owner');
    }
    console.log('   ✅ PASSED: Soft-delete successful.');

    // 6. Verify chatbot is hidden from active list but present in trash
    console.log('\n🔍 Step 6: Verifying active list exclusion and trash retrieval...');
    const activeBotsRes = await fetch(`${BASE_URL}/api/bots`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const activeBots = await activeBotsRes.json() as any[];
    const isPresentInActive = activeBots.some(b => b.id === testBot.id);

    const trashBotsRes = await fetch(`${BASE_URL}/api/bots?trashOnly=true`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const trashBots = await trashBotsRes.json() as any[];
    const isPresentInTrash = trashBots.some(b => b.id === testBot.id);

    console.log(`   Present in Active List: ${isPresentInActive} (Expected: false)`);
    console.log(`   Present in Trash List: ${isPresentInTrash} (Expected: true)`);
    if (isPresentInActive || !isPresentInTrash) {
      throw new Error('Soft-deleted bot indexing state mismatch');
    }
    console.log('   ✅ PASSED: Soft-deleted chatbot correctly removed from active dashboard and present in trash.');

    // 7. Restore the soft-deleted chatbot within 30 days
    console.log('\n🔄 Step 7: Restoring soft-deleted chatbot...');
    const restoreRes = await fetch(`${BASE_URL}/api/bots/${testBot.id}/restore`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const restoreData = await restoreRes.json() as any;
    console.log(`   Response: ${JSON.stringify(restoreData)}`);
    if (!restoreRes.ok || !restoreData.success) {
      throw new Error('Chatbot restoration failed');
    }
    console.log('   ✅ PASSED: Chatbot successfully restored.');

    // 8. Test Permanent Purge Deletion (Cascade delete configuration, history, files, keys, AI settings)
    console.log('\n💥 Step 8: Permanent Cascade Purge Deletion...');
    const purgeRes = await fetch(`${BASE_URL}/api/bots/${testBot.id}?permanent=true&purgeKb=true&purgeHistory=true`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const purgeData = await purgeRes.json() as any;
    console.log(`   Response: ${JSON.stringify(purgeData)}`);
    if (!purgeRes.ok || !purgeData.success) {
      throw new Error('Permanent purge deletion failed');
    }

    // Verify completely purged from DB
    const finalCheckRes = await fetch(`${BASE_URL}/api/bots?includeDeleted=true`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const finalBots = await finalCheckRes.json() as any[];
    const existsAnywhere = finalBots.some(b => b.id === testBot.id);
    console.log(`   Bot exists anywhere in DB: ${existsAnywhere} (Expected: false)`);
    if (existsAnywhere) {
      throw new Error('Permanently purged chatbot still found in DB');
    }
    console.log('   ✅ PASSED: Permanent purge cascade deletion completed successfully.');

    console.log('\n====================================================');
    console.log('🎉 ALL DELETE CHATBOT TESTS PASSED 100%!');
    console.log('====================================================\n');

  } catch (err: any) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

runDeleteChatbotTestSuite();
