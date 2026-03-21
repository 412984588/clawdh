-- Storage bucket for ticket files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ticket-files',
  'ticket-files',
  FALSE,
  52428800, -- 50MB
  ARRAY[
    'text/csv', 'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/pdf', 'text/plain', 'application/json',
    'application/zip', 'application/x-zip-compressed'
  ]
);

-- Only authenticated users can access ticket files
CREATE POLICY "ticket_files_auth_only" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'ticket-files'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "ticket_files_insert" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'ticket-files'
    AND auth.role() = 'authenticated'
  );
