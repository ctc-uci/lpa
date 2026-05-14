-- Persisted invoice subtotal (sessions + adjustments); kept in sync by the app.
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS total_amount numeric(14, 2) NOT NULL DEFAULT 0;

-- List / allocation helpers
CREATE INDEX IF NOT EXISTS idx_invoices_event_id ON public.invoices (event_id);

-- Paid sums, LATERAL last-payment, coverage query
CREATE INDEX IF NOT EXISTS idx_comments_invoice_adjustment ON public.comments (invoice_id, adjustment_type);

CREATE INDEX IF NOT EXISTS idx_comments_invoice_paid_datetime
  ON public.comments (invoice_id, datetime)
  WHERE adjustment_type = 'paid';
