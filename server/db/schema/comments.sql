CREATE TYPE adjustment AS ENUM ('none', 'total', 'rate_flat', 'rate_percent', 'paid');

CREATE TABLE comments (
    id INT PRIMARY KEY UNIQUE NOT NULL DEFAULT nextval('comment_id_seq'),
    user_id INT REFERENCES users(id) NOT NULL,
    invoice_id INT REFERENCES invoices(id) NOT NULL,
    datetime TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    comment TEXT NOT NULL,
    adjustment_type adjustment DEFAULT 'none',
    adjustment_value NUMERIC DEFAULT 0
);