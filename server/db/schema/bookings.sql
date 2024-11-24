CREATE TABLE bookings (
  id INT PRIMARY KEY UNIQUE NOT NULL DEFAULT nextval('booking_id_seq'),
  event_id INT REFERENCES events(id),
  room_id INT REFERENCES rooms(id),
  start_time TIME WITH TIME ZONE NOT NULL,
  end_time TIME WITH TIME ZONE NOT NULL,
  date DATE NOT NULL,
  archived BOOL NOT NULL DEFAULT false
  
);