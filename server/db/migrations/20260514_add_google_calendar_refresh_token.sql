-- Run against your Postgres database (e.g. psql or migration runner).
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS google_calendar_refresh_token TEXT;

COMMENT ON COLUMN public.users.google_calendar_refresh_token IS
    'Google OAuth refresh token for Calendar API; never expose to clients.';
