const assert = require('node:assert');

async function runTests() {
  const base = process.env.BASE_URL || 'http://localhost:8802';
  console.log('Testing Desk Harness at', base);

  // 1. Health check
  const hRes = await fetch(`${base}/api/health`);
  assert.strictEqual(hRes.status, 200);
  const hJson = await hRes.json();
  assert.strictEqual(hJson.service, 'desk-harness');

  // 2. Dashboard check
  const dRes = await fetch(`${base}/api/dashboard`);
  assert.strictEqual(dRes.status, 200);
  const dJson = await dRes.json();
  assert.ok(dJson.tickets.length >= 2);

  // 3. Autonomous Refund Triage
  const tRes = await fetch(`${base}/api/tickets/triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: '株式会社ネクサス 渡辺様',
      raw_inquiry: '3日前に間違えて決済してしまったので全額返金をお願いします。',
    }),
  });
  assert.strictEqual(tRes.status, 200);
  const tJson = await tRes.json();
  assert.strictEqual(tJson.ok, true);
  assert.strictEqual(tJson.ticket.resolution_status, 'auto_resolved');
  assert.ok(tJson.ticket.ai_confidence >= 90);

  // 4. Escalation Lock Test
  const eRes = await fetch(`${base}/api/tickets/triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: 'クレーマーテスト様',
      raw_inquiry: 'ふざけるな！今すぐ対応しないと弁護士と消費者センターに相談してSNSで拡散します',
    }),
  });
  const eJson = await eRes.json();
  assert.strictEqual(eJson.ticket.priority_level, 'P0_CRITICAL');
  assert.strictEqual(eJson.ticket.resolution_status, 'escalated_to_human');

  // 5. MCP endpoint check
  const mcpRes = await fetch(`${base}/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name: 'list_support_tickets', arguments: {} },
    }),
  });
  assert.strictEqual(mcpRes.status, 200);

  console.log('✅ Desk Harness E2E tests passed!');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
