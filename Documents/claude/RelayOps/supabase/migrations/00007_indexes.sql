-- Performance indexes
CREATE INDEX idx_tickets_organization_id ON tickets(organization_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_by ON tickets(created_by);
CREATE INDEX idx_tickets_due_at ON tickets(due_at);
CREATE INDEX idx_ticket_assignments_ticket_id ON ticket_assignments(ticket_id);
CREATE INDEX idx_ticket_assignments_worker_id ON ticket_assignments(worker_id);
CREATE INDEX idx_submissions_ticket_id ON submissions(ticket_id);
CREATE INDEX idx_reviews_ticket_id ON reviews(ticket_id);
CREATE INDEX idx_ledger_entries_ticket_id ON ledger_entries(ticket_id);
CREATE INDEX idx_ledger_entries_organization_id ON ledger_entries(organization_id);
CREATE INDEX idx_attachments_ticket_id ON attachments(ticket_id);
CREATE INDEX idx_ticket_events_ticket_id ON ticket_events(ticket_id);
CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
