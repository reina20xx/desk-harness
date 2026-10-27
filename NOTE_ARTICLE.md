# 【SaaS is Dead 第2弾】月額数十万円のZendesk・Intercom・FAQシステムを代替！RAG規約照合＋返金・請求書再発行まで自律完結する「Desk Harness」をOSS公開しました

「SaaS is Dead」の象徴的な実例として世界中で引用されたのが、決済大手Klarna社が **既存のカスタマーサポートSaaS（Intercom / Zendesk等）を解約し、自社AIエージェントに置き換えたことで700人分の業務を自動化（年間約60億円のコスト削減）した事例** です。

これまで企業のカスタマーサポート（CS）部門は、二重三重のSaaS課金に苦しめられてきました。

- **「1席あたり月額1.5万〜2.2万円のオペレーター課金」**: スタッフが10人いればそれだけで年間250万円超の固定費
- **「AI自動解決1件あたり$0.99（約150円）の従量課金」**: Intercom FinやZendesk AIのように、AIが答えるたびに追加課金される設計
- **「FAQ検索SaaSだけで月額30万円〜」**: 単なる社内ドキュメント検索（Helpfeel等）に年間数百万円を支払いながら、結局「領収書の宛名変更」「決済7日以内の返金処理」は人間が手で管理画面を叩いている

「URLを案内するだけのチャットボット」ではなく、**社内規定（RAG）と照合して、実際のバックエンド処理（返金API実行・適格請求書PDFの再発行）までAIが0秒で自律完結させる** ため、Cloudflare Workers + D1（月額0円）で動作する自律型AIヘルプデスク **「Desk Harness」** をMITライセンスのOSSとして公開しました！

🔗 **GitHubリポジトリ**: https://github.com/reina20xx/desk-harness

---

## Desk Harness の5大コア機能

### 1. 単なるFAQ案内ではない「自律アクション実行型（Agentic Resolution）」
従来のチャットボットは「こちらのヘルプページをご覧ください」とリンクを貼って終わりでした。Desk Harnessは社内規定テーブル（`kb_articles`）と照合し、条件を満たしていればアクションまで完結させます。
- **インボイス領収書の宛名変更・再発行依頼** ➔ 適格請求書PDFを再生成して自動添付送付（Confidence 97%）
- **7日以内の誤決済・返金依頼** ➔ 決済日時と利用ログを規約照合し、Stripe全額返金APIを自動実行（Confidence 93%）

### 2. 炎上・法的リスクワードを即座に検知する「P0 有人ロック（セーフティガードレール）」
AIにすべてを自動返信させると、重篤なクレームに定型文を返してSNS炎上を招く危険があります。

```typescript
const isFlameOrLegal = /弁護士|消費者センター|訴訟|SNS|拡散|詐欺|最悪|ふざけるな/.test(text);
if (isFlameOrLegal) {
  // 自動返信を即座に遮断し、P0_CRITICALとしてCS責任者へエスカレーション（SLA 15分）
  resolution_status = 'escalated_to_human';
}
```

### 3. シート課金0円・解決従量課金0円のサーバーレスD1設計
オペレーターが何人に増えても、AIが月間何万件のチケットを自動解決しても、Cloudflare D1 + Workers上では追加のシート課金・解決課金は一切発生しません。

### 4. 自律解決率（Auto-Resolution Rate）のリアルタイム計測
ダッシュボード上で「AIが人間を介さずに何%のチケットを即時解決したか」「年間いくらのSaaS固定費を削減したか」を一目で把握できます。

### 5. Claude Code / Cursor と直結する「MCP Server」内蔵
- 「新しく届いた問い合わせをトリアージして、規約内なら自動処理して」➔ `triage_and_resolve_ticket`
- 「現在のサポートチケット一覧とエスカレーション案件を出して」➔ `list_support_tickets`

---

## 5分で試せるクイックスタート

```bash
git clone https://github.com/reina20xx/desk-harness.git
cd desk-harness
npm install
npm run dev
```

ブラウザで `http://localhost:8802` を開くと、返金・請求書再発行の自律解決と、炎上リスク検知時の有人エスカレーションロックをすぐに体験できます。

🔗 **GitHub**: https://github.com/reina20xx/desk-harness
（ぜひ Star ⭐ をいただけると励みになります！）
