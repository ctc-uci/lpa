CREATE TABLE events (
  id INT PRIMARY KEY UNIQUE NOT NULL DEFAULT nextval('event_id_seq'),
  name VARCHAR(256) NOT NULL,
  description VARCHAR(256),
  archived BOOL NOT NULL DEFAULT False
);