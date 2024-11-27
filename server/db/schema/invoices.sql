CREATE TABLE invoices (
  id INT PRIMARY KEY UNIQUE NOT NULL DEFAULT nextval('invoice_id_seq'),
  event_id INT NOT NULL REFERENCES events(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_sent BOOL NOT NULL DEFAULT False,
  payment_status payment NOT NULL DEFAULT 'none'

);