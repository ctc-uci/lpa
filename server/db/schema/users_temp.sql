CREATE TABLE users (
  id INT PRIMARY KEY UNIQUE NOT NULL DEFAULT nextval('user_id_seq'),
  first_name VARCHAR(256) NOT NULL,
  last_name VARCHAR(256) NOT NULL,
  email VARCHAR(256) UNIQUE NOT NULL,
  firebase_uid VARCHAR(128) UNIQUE NOT NULL,
  edit_perms BOOL DEFAULT FALSE
);