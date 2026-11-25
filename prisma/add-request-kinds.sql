-- Run against the ISS MySQL database before deploying the multi-kind request
-- code. `change` is the default so every existing row keeps its old meaning.

ALTER TABLE requests
  ADD COLUMN kind VARCHAR(20) NOT NULL DEFAULT 'change' AFTER user,
  ADD COLUMN payload TEXT NULL AFTER kind,
  ADD COLUMN requesterEmplCode VARCHAR(20) NULL AFTER payload;

-- Old IT Request Form rows were already distinguishable by pgtype; keep them
-- distinct instead of letting the default label them as change requests.
UPDATE requests SET kind = 'it-request' WHERE pgtype = 'it-request';

CREATE INDEX idx_requests_kind ON requests (kind);
CREATE INDEX idx_requests_requester_empl_code ON requests (requesterEmplCode);
