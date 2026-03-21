-- Tighten storage access for ticket attachments.
-- Current runtime still uses service-role upload + signed download URLs,
-- but authenticated policies should be safe if browser direct access is added later.

DROP POLICY IF EXISTS "ticket_files_auth_only" ON storage.objects;
DROP POLICY IF EXISTS "ticket_files_insert" ON storage.objects;

CREATE POLICY "ticket_files_select_admin" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'ticket-files'
    AND split_part(name, '/', 1) <> ''
    AND EXISTS (
      SELECT 1
      FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

CREATE POLICY "ticket_files_insert_admin" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'ticket-files'
    AND split_part(name, '/', 1) <> ''
    AND EXISTS (
      SELECT 1
      FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

CREATE POLICY "ticket_files_select_partner" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'ticket-files'
    AND split_part(name, '/', 1) <> ''
    AND EXISTS (
      SELECT 1
      FROM users
      JOIN tickets
        ON tickets.id::text = split_part(storage.objects.name, '/', 1)
      WHERE users.id = auth.uid()
        AND users.role = 'partner'
        AND users.organization_id = tickets.organization_id
    )
  );

CREATE POLICY "ticket_files_insert_partner" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'ticket-files'
    AND split_part(name, '/', 1) <> ''
    AND EXISTS (
      SELECT 1
      FROM users
      JOIN tickets
        ON tickets.id::text = split_part(storage.objects.name, '/', 1)
      WHERE users.id = auth.uid()
        AND users.role = 'partner'
        AND users.organization_id = tickets.organization_id
    )
  );

CREATE POLICY "ticket_files_select_worker" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'ticket-files'
    AND split_part(name, '/', 1) <> ''
    AND EXISTS (
      SELECT 1
      FROM users
      JOIN worker_profiles
        ON worker_profiles.user_id = users.id
      JOIN ticket_assignments
        ON ticket_assignments.worker_id = worker_profiles.id
      WHERE users.id = auth.uid()
        AND users.role = 'worker_internal'
        AND ticket_assignments.ticket_id::text = split_part(storage.objects.name, '/', 1)
    )
  );

CREATE POLICY "ticket_files_insert_worker" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'ticket-files'
    AND split_part(name, '/', 1) <> ''
    AND EXISTS (
      SELECT 1
      FROM users
      JOIN worker_profiles
        ON worker_profiles.user_id = users.id
      JOIN ticket_assignments
        ON ticket_assignments.worker_id = worker_profiles.id
      WHERE users.id = auth.uid()
        AND users.role = 'worker_internal'
        AND ticket_assignments.ticket_id::text = split_part(storage.objects.name, '/', 1)
    )
  );
