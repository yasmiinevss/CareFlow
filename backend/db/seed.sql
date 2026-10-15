-- Fictional data for local development
INSERT INTO patients (last_name, first_name) VALUES
  ('Durand',  'Marie'),
  ('Le Gall', 'Jean-Pierre'),
  ('Moreau',  'Hélène'),
  ('Petit',   'Lucas');

INSERT INTO appointments
  (patient_id, doctor_name, scheduled_at, duration_minutes, consultation_type, status)
VALUES
  (1, 'Dr. Martin',  '2026-11-03 09:00:00+01', 30, 'first_visit', 'scheduled'),
  (1, 'Dr. Martin',  '2026-10-01 10:30:00+02', 15, 'follow_up',   'completed'),
  (2, 'Dr. Leroy',   '2026-11-05 14:00:00+01', 15, 'urgent',      'scheduled'),
  (2, 'Dr. Leroy',   '2026-10-08 16:00:00+02', 30, 'follow_up',   'no_show'),
  (3, 'Dr. Martin',  '2026-11-10 11:00:00+01', 30, 'first_visit', 'cancelled'),
  (4, 'Dr. Bernard', '2026-11-12 08:30:00+01', 15, 'follow_up',   'scheduled');