import { useEffect, useState, type SyntheticEvent } from 'react';
import type { Appointment, ApiError } from '../types';

type Patient = { id: number; last_name: string; first_name: string };

type Props = {
  onCreated: (appointment: Appointment) => void;
};

// Form to create a new appointment
export default function AppointmentForm({ onCreated }: Props) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    fetch('/api/patients')
      .then((response) => response.json())
      .then(setPatients)
      .catch(() => setError({ code: 'NETWORK_ERROR', message: 'Impossible de charger les patients.' }));
  }, []);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setError(null);

    const body = {
      patient_id: Number(form.get('patient_id')),
      doctor_name: form.get('doctor_name'),
      scheduled_at: new Date(String(form.get('scheduled_at'))).toISOString(),
      duration_minutes: Number(form.get('duration_minutes')),
      consultation_type: form.get('consultation_type'),
    };

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }
      onCreated(data);
      formElement.reset();
    } catch {
      setError({ code: 'NETWORK_ERROR', message: 'Impossible de contacter le serveur.' });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Nouveau rendez-vous</h2>

      {error && <p role="alert">{error.message}</p>}

      <label>
        Patient
        <select name="patient_id" required>
          <option value="">Choisir un patient</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.last_name} {patient.first_name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Médecin
        <input type="text" name="doctor_name" required />
      </label>

      <label>
        Date et heure
        <input type="datetime-local" name="scheduled_at" required />
      </label>

      <label>
        Durée (minutes)
        <input type="number" name="duration_minutes" min="15" max="30" defaultValue="30" required />
      </label>

      <label>
        Type de consultation
        <select name="consultation_type" required>
          <option value="follow_up">Suivi</option>
          <option value="first_visit">Première visite</option>
          <option value="urgent">Urgence</option>
        </select>
      </label>

      <button type="submit">Créer le rendez-vous</button>
    </form>
  );
}