import http from 'http';

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

async function runQuickTest() {
  const threads = await makeGet('/api/threads');
  console.log('Threads count:', Array.isArray(threads) ? threads.length : threads);
  if (Array.isArray(threads) && threads.length > 0) {
    const threadId = threads[0].id;
    const history = await makeGet(`/api/chat/history?threadId=${threadId}`);
    console.log(`History for ${threadId}:`, history.messages ? history.messages.length + ' messages' : history);
  }
}

runQuickTest();
