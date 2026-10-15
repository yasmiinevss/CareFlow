import { assertUpdateAllowed } from '../services/appointmentRules.js';
import * as appointmentRepository from '../repositories/appointmentRepository.js';
import { AppError } from '../utils/AppError.js';

export async function updateAppointment(id, changes) {
  const current = await appointmentRepository.findById(id);
  if (!current) {
    throw new AppError(404, 'NOT_FOUND', `Appointment ${id} not found`);
  }

  assertUpdateAllowed(current.status, changes);

  return appointmentRepository.update(id, changes);
}