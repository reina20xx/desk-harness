DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS kb_articles;

CREATE TABLE kb_articles (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  policy_rule TEXT NOT NULL,
  resolution_template TEXT NOT NULL
);

CREATE TABLE tickets (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  inquiry_category TEXT NOT NULL,
  priority_level TEXT NOT NULL,
  sentiment_flag TEXT NOT NULL,
  rag_matched_article TEXT NOT NULL,
  ai_confidence INTEGER NOT NULL,
  agent_action_taken TEXT NOT NULL,
  resolution_status TEXT NOT NULL,
  ai_reply_draft TEXT NOT NULL,
  raw_inquiry TEXT NOT NULL,
  created_at TEXT NOT NULL
);

INSERT INTO kb_articles (id, category, title, policy_rule, resolution_template) VALUES
('kb_01', 'Billing / 請求・領収書', 'インボイス対応領収書・請求書の宛名変更および再発行手順', '管理画面「請求履歴」から即時PDF再発行可能。エージェントによる自動宛名変更・再送付を許可。', 'ご指定の宛名にて適格請求書（インボイス登録番号付PDF）を再発行し、メール添付にて自動送付いたしました。'),
('kb_02', 'Refund / 解約・返金', '年額プランのクーリングオフ・7日以内全額返金規定', '決済後7日以内かつ利用ログ10回未満の場合は全額返金承認。それ以降は次回更新停止のみ。', '決済日から7日以内の規約条件を満たしていることを確認し、Stripe決済の全額返金処理を実行いたしました。'),
('kb_03', 'Bug / 障害・ログイン不可', '二要素認証（2FA）ロック解除およびSSO連携エラー対応', '法人のみ本人確認後に2FA一時リセットリンクを発行。消費者庁・法的措置・炎上ワード含有時はP0エスカレーション。', 'セキュリティ保護のため有人スーパーバイザーへ即時エスカレーションし、最優先（SLA 15分以内）で対応いたします。');

INSERT INTO tickets (id, customer_name, customer_email, inquiry_category, priority_level, sentiment_flag, rag_matched_article, ai_confidence, agent_action_taken, resolution_status, ai_reply_draft, raw_inquiry, created_at) VALUES
('tkt_001', '株式会社フロンティア 経理部 木村様', 'kimura@frontier-example.jp', 'Billing / 請求・領収書', 'P2_NORMAL', '🟢 通常（事務手続き依頼）', 'kb_01: インボイス対応領収書・請求書の宛名変更および再発行手順', 96, '✅ 自動完結：宛名を「株式会社フロンティア」へ変更しインボイスPDFを再送付済', 'auto_resolved', '木村様\nいつもご利用ありがとうございます。ご依頼いただいた10月度適格請求書（インボイス番号付）の宛名を「株式会社フロンティア」様へ変更し、再発行PDFを本メールに添付いたしました。追加のお手続きは不要です。', '今月の請求書の宛名を個人名から「株式会社フロンティア」に変更してインボイス対応の領収書を再発行してください。', '2026-10-26T14:20:00Z'),
('tkt_002', '株式会社アーク 伊藤様', 'ito@ark-example.jp', 'Escalation / 炎上・解約リスク', 'P0_CRITICAL', '🚨 炎上・法的リスク検知（有人ロック）', 'kb_03: 二要素認証ロック解除および緊急エスカレーション規定', 42, '🛑 自動送信ブロック：法務・CS責任者へSlack緊急通知済（SLA 15分）', 'escalated_to_human', '伊藤様\n多大なるご不便とご不快な思いをおかけしており誠に申し訳ございません。本件は最優先事項としてCS責任者が直接状況を確認し、15分以内に個別にご連絡申し上げます。', 'ログインできない状態が2日続いて業務が止まっています。今日中に解決しなければ解約してSNSと消費者センターに報告します。', '2026-10-26T16:05:00Z');
