# Governed estate-matter workflow

`/api/governed-matters` stores tenant-scoped intake with jurisdiction and effective rule provenance, beneficiary/asset consistency checks, immutable document-version references and checksums, optimistic transitions, and an audit history. Only a JWT carrying both `role=attorney` and an administrator-verified attorney-license claim can approve. Execution requires evidence. The assessment explicitly reports `legalAdvice: false`.

The repository does not verify licenses, supply legal advice, establish privilege, notarize, sign, or determine jurisdictional validity. Document storage, e-signature/notary, calendar, asset import, and matter-system adapters require contracted providers, encryption/key management, retention policy, counsel review, and jurisdiction-specific test fixtures.

Use explicit bootstrap/migration, non-mutating start, and separately confirmed demo seed scripts.
