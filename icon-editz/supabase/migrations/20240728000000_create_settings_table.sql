CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB
);

INSERT INTO settings (key, value) VALUES ('seo', '{}');
INSERT INTO settings (key, value) VALUES ('analytics', '{}');
