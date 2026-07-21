BEGIN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS jurisdiction VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(32) NOT NULL DEFAULT 'client';
ALTER TABLE users ADD COLUMN IF NOT EXISTS attorney_license_verified BOOLEAN NOT NULL DEFAULT FALSE;
CREATE TABLE IF NOT EXISTS estate_matters (id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, idempotency_key TEXT NOT NULL, jurisdiction TEXT NOT NULL, rule_version TEXT NOT NULL, rule_effective_at DATE NOT NULL, state TEXT NOT NULL DEFAULT 'intake', facts JSONB NOT NULL, assessment JSONB NOT NULL, privilege_label TEXT NOT NULL DEFAULT 'confidential', version INTEGER NOT NULL DEFAULT 1, created_by BIGINT, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(tenant_id,idempotency_key));
CREATE TABLE IF NOT EXISTS estate_document_versions (id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, matter_id BIGINT REFERENCES estate_matters(id), document_kind TEXT NOT NULL, version INTEGER NOT NULL, storage_reference TEXT NOT NULL, checksum TEXT NOT NULL, execution_status TEXT NOT NULL DEFAULT 'draft', created_by BIGINT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(tenant_id,matter_id,document_kind,version));
CREATE TABLE IF NOT EXISTS estate_matter_audit (id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, matter_id BIGINT REFERENCES estate_matters(id), actor_id BIGINT, action TEXT NOT NULL, details JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE INDEX IF NOT EXISTS estate_matter_tenant_state_idx ON estate_matters(tenant_id,state,updated_at DESC);
COMMIT;
