-- 收紧 ticket_assignments 的 worker SELECT 策略
-- 修复前：所有 worker 可以看到所有 assignment
-- 修复后：worker 只能看到自己名下的 assignment（通过 worker_profiles.user_id = auth.uid() 联查）

-- 删除旧的宽松 SELECT 策略
DROP POLICY IF EXISTS "workers_select_own_assignments" ON ticket_assignments;
DROP POLICY IF EXISTS "worker_select_own_assignments" ON ticket_assignments;
DROP POLICY IF EXISTS "workers_can_view_assignments" ON ticket_assignments;

-- 创建新的精确 SELECT 策略：只允许查看自己名下的 assignment
CREATE POLICY "worker_select_own_assignments" ON ticket_assignments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM worker_profiles wp
      WHERE wp.id = ticket_assignments.worker_id
        AND wp.user_id = auth.uid()
    )
  );
