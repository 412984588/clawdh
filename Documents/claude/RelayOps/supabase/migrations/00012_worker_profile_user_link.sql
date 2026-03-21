-- 给 worker_profiles 增加 user_id 列，建立到 users 表的 FK
-- 这是 M3/M4 的共同依赖：
--   M3: notification.service 可通过 worker_profiles.user_id 找到 users.email
--   M4: RLS 可通过 wp.user_id = auth.uid() 精确限制 worker 只见自己的 assignment

ALTER TABLE worker_profiles
  ADD COLUMN user_id UUID UNIQUE REFERENCES users(id);

COMMENT ON COLUMN worker_profiles.user_id IS
  'Links worker profile to their auth-enabled user account. Required for RLS and notification routing.';

-- 收紧 ticket_assignments 的 worker SELECT policy
-- 原 policy（00011）对 worker 角色放行全部，改为只允许看自己被分配的
DROP POLICY IF EXISTS "worker_select_ticket_assignments" ON ticket_assignments;

CREATE POLICY "worker_select_ticket_assignments" ON ticket_assignments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM worker_profiles wp
      WHERE wp.id = ticket_assignments.worker_id
        AND wp.user_id = auth.uid()
    )
  );
