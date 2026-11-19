import type { Appointment } from '../types';

type Props = {
  appointments: Appointment[];
  onCancel: (id: number) => void;
};

export default function AppointmentList({ appointments, onCancel }: Props) {
  return (
    <ul>
      {appointments.map((appointment) => (
        <li key={appointment.id}>
          {new Date(appointment.scheduled_at).toLocaleString('fr-FR')}, {appointment.doctor_name} ({appointment.status})
          {appointment.status === 'scheduled' && (
            <button type="button" onClick={() => onCancel(appointment.id)}>
              Annuler
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

