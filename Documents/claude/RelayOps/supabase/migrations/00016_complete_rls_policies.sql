-- 补全 RLS 策略：
-- 1. tickets INSERT — Partner 只能创建属于自己组织的工单（使用 get_user_role/get_user_org_id 辅助函数）
-- 2. ledger_entries INSERT — 禁止 authenticated user 直接写入（必须通过 service_role client）

----------------------------------------------------------------------
-- 1. tickets INSERT
-- 00009 中已有同名策略，先删后建以保证幂等性；
-- 改为使用 get_user_role / get_user_org_id 辅助函数，与其他策略风格保持一致
----------------------------------------------------------------------
DROP POLICY IF EXISTS "tickets_partner_insert" ON tickets;
DROP POLICY IF EXISTS "partner_insert_tickets" ON tickets;

CREATE POLICY "tickets_partner_insert" ON tickets FOR INSERT WITH CHECK (
  get_user_role(auth.uid()) = 'partner'
  AND organization_id = get_user_org_id(auth.uid())
);

----------------------------------------------------------------------
-- 2. ledger_entries INSERT
-- service_role 始终绕过 RLS，不受此策略影响。
-- WITH CHECK (false) 明确拒绝 authenticated client 直接写入，
-- 确保所有账务操作必须经由 admin/service_role client 走 workflow 层。
----------------------------------------------------------------------
DROP POLICY IF EXISTS "ledger_no_user_insert" ON ledger_entries;

CREATE POLICY "ledger_no_user_insert" ON ledger_entries FOR INSERT WITH CHECK (false);
