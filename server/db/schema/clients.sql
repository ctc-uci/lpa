CREATE TYPE client_role AS ENUM ('payee', 'instructor');

CREATE TABLE clients (
  id INT PRIMARY KEY UNIQUE NOT NULL DEFAULT nextval('client_id_seq'),
  event_id INT REFERENCES events(id) NOT NULL,
  role client_role NOT NULL,
  name VARCHAR(256) NOT NULL,
  email VARCHAR(256) NOT NULL
);
