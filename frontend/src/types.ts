export type Appointment = {
  id: number;
  patient_id: number;
  doctor_name: string;
  scheduled_at: string;
  duration_minutes: number;
  consultation_type: 'urgent' | 'follow_up' | 'first_visit';
  status: 'scheduled' | 'cancelled' | 'completed' | 'no_show';
  created_at: string;
};

export type ApiError = { code: string; message: string };