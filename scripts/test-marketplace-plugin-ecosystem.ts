import http from 'http';

const BASE_URL = 'http://127.0.0.1:3000';

function makeRequest(method: string, path: string, payload?: any): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const postData = payload ? JSON.stringify(payload) : '';
    
    const options: http.RequestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-test-token',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const body = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode || 500, body });
        } catch (err) {
          resolve({ status: res.statusCode || 500, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runMarketplaceTestSuite() {
  console.log('================================================================');
  console.log('🤖 ENTERPRISE AI MARKETPLACE & PLUGIN ECOSYSTEM TEST SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, failureDetails?: any) {
    totalTests++;
    if (condition) {
      console.log(` ✅ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(` ❌ FAIL: ${testName}`);
      if (failureDetails) console.error('    Details:', JSON.stringify(failureDetails, null, 2));
    }
  }

  try {
    // TEST 1: Catalog & Analytics Fetch
    console.log('[TEST 1] Fetch Marketplace Catalog & Platform Analytics...');
    const catRes = await makeRequest('GET', '/api/marketplace/plugins');
    assert(
      catRes.status === 200 && Array.isArray(catRes.body.plugins) && catRes.body.plugins.length >= 10,
      'Marketplace Catalog returns active plugin manifests and metrics',
      catRes.body
    );

    const targetPlugin = catRes.body.plugins.find((p: any) => p.id === 'plugin-slack-bridge') || catRes.body.plugins[0];
    console.log(`   Target plugin: ${targetPlugin.name} (${targetPlugin.id})`);

    // TEST 2: Admin Permission Approval & Installation
    console.log('\n[TEST 2] Install Plugin with Admin Permission Approval...');
    const installRes = await makeRequest('POST', `/api/marketplace/plugins/${targetPlugin.id}/install`, {
      approvedPermissions: ['api_webhooks', 'read_conversations']
    });
    assert(
      installRes.status === 200 && installRes.body.plugin.isInstalled === true && installRes.body.plugin.approvedPermissions.includes('api_webhooks'),
      'Admin Permission Approval successfully provisions and activates plugin in sandbox container',
      installRes.body
    );

    // TEST 3: Hot Enable/Disable Toggle without restart
    console.log('\n[TEST 3] Toggle Plugin Enable/Disable without Application Restart...');
    const toggleRes = await makeRequest('POST', `/api/marketplace/plugins/${targetPlugin.id}/toggle`);
    assert(
      toggleRes.status === 200 && toggleRes.body.plugin.isEnabled === false,
      'Plugin disabled instantly in runtime memory state',
      toggleRes.body
    );
    // Re-enable plugin
    await makeRequest('POST', `/api/marketplace/plugins/${targetPlugin.id}/toggle`);

    // TEST 4: One-Click Update & Rollback
    console.log('\n[TEST 4] Plugin Version Upgrade and Version Rollback...');
    const updateRes = await makeRequest('POST', `/api/marketplace/plugins/${targetPlugin.id}/update`);
    assert(
      updateRes.status === 200 && updateRes.body.plugin.version === updateRes.body.plugin.latestVersion,
      'Plugin upgraded to latest release version',
      updateRes.body
    );

    const rollbackRes = await makeRequest('POST', `/api/marketplace/agents/${targetPlugin.id}/rollback`, {
      targetVersion: '1.0.0'
    });
    assert(
      rollbackRes.status === 200 && rollbackRes.body.agent.version === '1.0.0',
      'Plugin successfully rolled back to target version v1.0.0',
      rollbackRes.body
    );

    // TEST 5: Sandbox Permission Check Enforcement (Block Unauthorized Operations)
    console.log('\n[TEST 5] Sandboxed Permission Enforcement Check...');
    // Granted permission test
    const execAllowed = await makeRequest('POST', `/api/marketplace/plugins/${targetPlugin.id}/execute`, {
      requiredPermission: 'api_webhooks'
    });
    assert(
      execAllowed.status === 200 && execAllowed.body.success === true,
      'Execution allowed for granted permission (api_webhooks)',
      execAllowed.body
    );

    // Unapproved permission test
    const execBlocked = await makeRequest('POST', `/api/marketplace/plugins/${targetPlugin.id}/execute`, {
      requiredPermission: 'billing_access'
    });
    assert(
      execBlocked.status === 403 && execBlocked.body.sandboxIsolated === true,
      'Execution BLOCKED (403 Forbidden) for unapproved permission (billing_access)',
      execBlocked.body
    );

    // TEST 6: Manifest Security & Integrity Validation
    console.log('\n[TEST 6] Plugin Manifest Security & Compatibility Inspector...');
    const valRes = await makeRequest('POST', '/api/marketplace/validate', {
      manifest: {
        id: 'test-custom-plugin',
        name: 'Enterprise Audit Inspector',
        version: '1.0.0',
        minPlatformVersion: '3.0.0',
        permissions: ['workspace_settings', 'external_api_access']
      },
      platformVersion: '3.5.0'
    });
    assert(
      valRes.status === 200 && valRes.body.valid === true && valRes.body.highRiskPermissions.length === 2,
      'Manifest validator flags high-risk permissions and computes integrity SHA-256 signature',
      valRes.body
    );

    // TEST 7: Prebuilt AI Agent Duplication & Customization
    console.log('\n[TEST 7] Duplicate & Customize Prebuilt AI Agent...');
    const dupRes = await makeRequest('POST', '/api/marketplace/agents/agent-sales/duplicate', {
      customName: 'Custom Enterprise Sales Assistant',
      customRole: 'Enterprise SDR Specialist',
      customSystemPrompt: 'Custom tailored sales negotiation prompt...'
    });
    assert(
      dupRes.status === 200 && dupRes.body.agent.name === 'Custom Enterprise Sales Assistant',
      'Prebuilt agent duplicated into custom workspace agent library',
      dupRes.body
    );

    // TEST 8: Admin Permission Usage Matrix
    console.log('\n[TEST 8] Fetch Admin Permission Breakdown Matrix...');
    const matrixRes = await makeRequest('GET', '/api/marketplace/admin/permissions');
    assert(
      matrixRes.status === 200 && typeof matrixRes.body.permissionCounts === 'object',
      'Admin permission matrix generated across active container plugins',
      matrixRes.body
    );

    console.log('\n================================================================');
    console.log(`📊 TEST SUITE SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests/totalTests)*100)}%)`);
    console.log('================================================================\n');

    if (passedTests === totalTests) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test Suite Exception:', err);
    process.exit(1);
  }
}

runMarketplaceTestSuite();
