-- 补充核心表的 INSERT/UPDATE/DELETE 写操作 RLS 策略
-- 背景：当前所有写操作走 admin/service_role client，已绕过 RLS，功能正常。
-- 本迁移在 authenticated 层面添加显式策略，提供纵深防御：
--   - 防止未来误用 browser/server client 做无授权写操作
--   - service_role 始终绕过 RLS，admin client 行为不变

----------------------------------------------------------------------
-- 1. organizations — 仅 admin 角色可通过 authenticated client 新建组织
--    （实际创建走 admin client，此策略为 browser 层防御）
----------------------------------------------------------------------
CREATE POLICY "admin_insert_organizations" ON organizations
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

----------------------------------------------------------------------
-- 2. partner_profiles — 仅 admin 可更新（审批状态变更等）
----------------------------------------------------------------------
CREATE POLICY "admin_update_partner_profiles" ON partner_profiles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

----------------------------------------------------------------------
-- 3. tickets — partner 可为自己的组织新建工单
----------------------------------------------------------------------
CREATE POLICY "partner_insert_tickets" ON tickets
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'partner'
        AND users.organization_id = tickets.organization_id
    )
  );

-- tickets UPDATE(status) — 不添加 authenticated UPDATE 策略
-- 意图：禁止任何 authenticated client 直接更新 status 字段
-- 所有状态变更必须经由 state machine（transitionTicket），使用 service_role client
-- RLS 启用但无 UPDATE policy = authenticated 写操作默认拒绝（PostgreSQL 行为）

----------------------------------------------------------------------
-- 4. users — 不添加 authenticated INSERT 策略
-- 用户注册/创建由 auth trigger + service_role client 完成，不走 authenticated 层
-- 显式注释说明：此为有意决定，authenticated client 禁止直接 INSERT users
----------------------------------------------------------------------
