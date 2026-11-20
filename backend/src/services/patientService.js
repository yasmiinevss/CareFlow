import * as patientRepository from '../repositories/patientRepository.js';
import { AppError } from '../utils/AppError.js';

export async function getPatientStats(id) {
  const patient = await patientRepository.findById(id);
  if (!patient) {
    throw new AppError(404, 'NOT_FOUND', `Patient ${id} not found`);
  }
  if (id <= 0 || !Number.isInteger(id)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Patient id must be a positive integer');
  };

  const stats = await patientRepository.getStatsByPatientId(id);
  return stats;
}