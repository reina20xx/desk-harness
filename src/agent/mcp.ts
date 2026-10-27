import { Bindings, evaluateSupportTicket } from '../index';

export async function handleMcpRequest(req: any, env: Bindings) {
  const { id, method, params } = req;

  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'desk-harness-mcp', version: '0.1.0' },
      },
    };
  }

  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        tools: [
          {
            name: 'triage_and_resolve_ticket',
            description: '顧客からの問い合わせをRAGナレッジ照合・炎上リスク判定・自律アクション実行まで一括処理します',
            inputSchema: {
              type: 'object',
              properties: {
                customer_name: { type: 'string' },
                customer_email: { type: 'string' },
                raw_inquiry: { type: 'string' },
              },
              required: ['customer_name', 'raw_inquiry'],
            },
          },
          {
            name: 'list_support_tickets',
            description: '現在のサポートチケット一覧とAI自律解決率を取得します',
            inputSchema: { type: 'object', properties: {} },
          },
        ],
      },
    };
  }

  if (method === 'tools/call') {
    const toolName = params?.name;
    const args = params?.arguments || {};

    if (toolName === 'triage_and_resolve_ticket') {
      const evalRes = evaluateSupportTicket(args);
      const tktId = `tkt_${Date.now()}`;
      const now = new Date().toISOString();
      await env.DB.prepare(
        `INSERT INTO tickets (id, customer_name, customer_email, inquiry_category, priority_level, sentiment_flag, rag_matched_article, ai_confidence, agent_action_taken, resolution_status, ai_reply_draft, raw_inquiry, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          tktId,
          args.customer_name,
          args.customer_email || 'customer@example.com',
          evalRes.inquiry_category,
          evalRes.priority_level,
          evalRes.sentiment_flag,
          evalRes.rag_matched_article,
          evalRes.ai_confidence,
          evalRes.agent_action_taken,
          evalRes.resolution_status,
          evalRes.ai_reply_draft,
          args.raw_inquiry,
          now
        )
        .run();

      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: JSON.stringify({ ticket_id: tktId, ...evalRes }, null, 2) }],
        },
      };
    }

    if (toolName === 'list_support_tickets') {
      const tickets = (await env.DB.prepare('SELECT * FROM tickets ORDER BY created_at DESC').all()).results || [];
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(tickets, null, 2) }],
        },
      };
    }
  }

  return {
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: 'Method not found' },
  };
}
