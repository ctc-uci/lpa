CREATE TABLE rooms (
  id INT PRIMARY KEY UNIQUE NOT NULL DEFAULT nextval('room_id_seq'),
  name VARCHAR(256) NOT NULL,
  description VARCHAR(256),
  rate NUMERIC NOT NULL
);