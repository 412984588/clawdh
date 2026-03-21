-- 补齐 00009 中只开了 RLS 但没有 SELECT policy 的 7 张表
-- partner_profiles / worker_profiles / ticket_assignments
-- submissions / reviews / payout_batches / disputes

----------------------------------------------------------------------
-- 1. partner_profiles (PK = organization_id，无 ticket_id)
----------------------------------------------------------------------
CREATE POLICY "admin_select_partner_profiles" ON partner_profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

CREATE POLICY "partner_select_partner_profiles" ON partner_profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'partner'
        AND users.organization_id = partner_profiles.organization_id
    )
  );

----------------------------------------------------------------------
-- 2. worker_profiles (无 user_id / ticket_id，worker 角色可见全部)
----------------------------------------------------------------------
CREATE POLICY "admin_select_worker_profiles" ON worker_profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

CREATE POLICY "worker_select_worker_profiles" ON worker_profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'worker_internal'
    )
  );

----------------------------------------------------------------------
-- 3. ticket_assignments (有 ticket_id)
----------------------------------------------------------------------
CREATE POLICY "admin_select_ticket_assignments" ON ticket_assignments
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- worker 只能看到分配给自己的 assignment
-- 注意：worker_profiles.id 与 users.id 无直接 FK，
-- 业务层通过 admin client 绕过 RLS；此处仅放行 worker 角色
CREATE POLICY "worker_select_ticket_assignments" ON ticket_assignments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'worker_internal'
    )
  );

----------------------------------------------------------------------
-- 4. submissions (有 ticket_id)
----------------------------------------------------------------------
CREATE POLICY "admin_select_submissions" ON submissions
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

CREATE POLICY "partner_select_submissions" ON submissions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      JOIN users u ON u.id = auth.uid()
      WHERE t.id = submissions.ticket_id
        AND t.organization_id = u.organization_id
        AND u.role = 'partner'
    )
  );

----------------------------------------------------------------------
-- 5. reviews (有 ticket_id)
----------------------------------------------------------------------
CREATE POLICY "admin_select_reviews" ON reviews
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

CREATE POLICY "partner_select_reviews" ON reviews
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      JOIN users u ON u.id = auth.uid()
      WHERE t.id = reviews.ticket_id
        AND t.organization_id = u.organization_id
        AND u.role = 'partner'
    )
  );

----------------------------------------------------------------------
-- 6. payout_batches (仅 admin)
----------------------------------------------------------------------
CREATE POLICY "admin_select_payout_batches" ON payout_batches
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

----------------------------------------------------------------------
-- 7. disputes (有 ticket_id)
----------------------------------------------------------------------
CREATE POLICY "admin_select_disputes" ON disputes
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

CREATE POLICY "partner_select_disputes" ON disputes
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      JOIN users u ON u.id = auth.uid()
      WHERE t.id = disputes.ticket_id
        AND t.organization_id = u.organization_id
        AND u.role = 'partner'
    )
  );
