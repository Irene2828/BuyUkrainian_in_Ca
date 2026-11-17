-- Apply before releasing the accompanying application change. Not run by tests.
ALTER TABLE stores ADD COLUMN IF NOT EXISTS geocoding_status text;
UPDATE stores SET geocoding_status = 'unresolved'
WHERE latitude = 56.1304 AND longitude = -106.3468 AND geocoding_status IS NULL;
