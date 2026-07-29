CREATE OR REPLACE FUNCTION update_settings(settings JSONB)
RETURNS void AS $$
BEGIN
  INSERT INTO settings (key, value)
  SELECT key, value FROM jsonb_each(settings)
  ON CONFLICT (key) DO UPDATE
  SET value = excluded.value;
END;
$$ LANGUAGE plpgsql;
