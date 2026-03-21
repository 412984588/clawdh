-- Migration: Add KYC fields to worker_profiles and create storage bucket
-- Created: 2026-03-21

-- 1. Create KYC status enum
CREATE TYPE kyc_status AS ENUM ('pending', 'verified', 'rejected');

-- 2. Add KYC fields to worker_profiles
ALTER TABLE worker_profiles 
  ADD COLUMN IF NOT EXISTS kyc_status kyc_status DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS kyc_submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS kyc_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS kyc_reviewer_id UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS kyc_documents_url TEXT,
  ADD COLUMN IF NOT EXISTS kyc_rejection_reason TEXT;

-- 3. CRITICAL: Set existing approved workers to verified to avoid breaking existing assignments
UPDATE worker_profiles 
  SET kyc_status = 'verified' 
  WHERE approval_status = 'approved' AND kyc_status = 'pending';

-- 4. Create index for KYC status queries
CREATE INDEX IF NOT EXISTS idx_worker_profiles_kyc_status ON worker_profiles(kyc_status);

-- 5. Create KYC documents storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

-- 6. RLS Policy: Workers can upload their own KYC documents
CREATE POLICY "worker_insert_kyc_documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'kyc-documents' AND
    (storage.foldername(name))[1] = (SELECT wp.id::text FROM worker_profiles wp WHERE wp.user_id = auth.uid())
  );

-- 7. RLS Policy: Workers can view their own KYC documents
CREATE POLICY "worker_select_kyc_documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'kyc-documents' AND
    (storage.foldername(name))[1] = (SELECT wp.id::text FROM worker_profiles wp WHERE wp.user_id = auth.uid())
  );

-- 8. RLS Policy: Admins can view all KYC documents
CREATE POLICY "admin_select_kyc_documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'kyc-documents' AND
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- 9. RLS Policy: Admins can delete KYC documents (for cleanup)
CREATE POLICY "admin_delete_kyc_documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'kyc-documents' AND
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );
