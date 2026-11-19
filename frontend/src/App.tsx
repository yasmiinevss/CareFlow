import { useEffect, useState } from 'react';
import type { Appointment, ApiError } from './types';
import AppointmentForm from './components/AppointmentForm';
import AppointmentList from './components/AppointmentList';

export default function App() {
  // 1. LES ÉTATS
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<ApiError | null>(null);

  // 2. LE CHARGEMENT À L'OUVERTURE DE LA PAGE
  useEffect(() => {
    async function loadAppointments() {
      try {
        const response = await fetch('/api/appointments');
        const data = await response.json();

        if (!response.ok) {
          setError(data.error);
          return;
        }
        setAppointments(data);
      } catch {
        setError({ code: 'NETWORK_ERROR', message: 'Impossible de contacter le serveur. Réessayez plus tard.' });
      }
    }

    loadAppointments();
  }, []);

  // 3. LES FONCTIONS QUI MODIFIENT LA LISTE
  function addAppointment(appointment: Appointment) {
    setAppointments((current) => [...current, appointment]);
  }

  async function cancelAppointment(id: number) {
    setError(null);
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }
      setAppointments((current) => current.map((a) => (a.id === data.id ? data : a)));
    } catch {
      setError({ code: 'NETWORK_ERROR', message: 'Impossible de contacter le serveur.' });
    }
  }

  // 4. L'AFFICHAGE
  return (
    <main>
      <h1>CareFlow</h1>

      <AppointmentForm onCreated={addAppointment} />

      {error && <p role="alert">{error.message}</p>}

      <h2>Rendez-vous</h2>
      <AppointmentList appointments={appointments} onCancel={cancelAppointment} />
    </main>
  );
}