-- Drop tables (development only) so the script can be re-run.
-- appointments first: it depends on patients.
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS patients;

CREATE TABLE patients (
  id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  last_name   VARCHAR(100) NOT NULL CHECK (last_name <> ''),
  first_name  VARCHAR(100) NOT NULL CHECK (first_name <> ''),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE appointments (
  id                 INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  patient_id         INTEGER      NOT NULL REFERENCES patients(id),
  doctor_name        VARCHAR(100) NOT NULL CHECK (doctor_name <> ''),
  scheduled_at       TIMESTAMPTZ  NOT NULL,
  duration_minutes   INTEGER      NOT NULL CHECK (duration_minutes BETWEEN 15 AND 30),
  consultation_type  VARCHAR(20)  NOT NULL
                     CHECK (consultation_type IN ('urgent', 'follow_up', 'first_visit')),
  status             VARCHAR(20)  NOT NULL DEFAULT 'scheduled'
                     CHECK (status IN ('scheduled', 'cancelled', 'completed', 'no_show')),
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Speeds up "all appointments of a patient" queries
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);