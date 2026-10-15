import {AppError} from '../utils/AppError.js';
import { checkName } from './patientValidator.js';

const CONSULTATION_TYPES = ['urgent', 'follow_up', 'first_visit'];
const MIN_DURATION = 15;
const MAX_DURATION = 30;

function fail(message) {
  throw new AppError(400, 'VALIDATION_ERROR', message);
}

export  function validateNewAppointment(body) {
  if (!body) fail('Request body is required');

  const { patient_id, doctor_name, scheduled_at, duration_minutes, consultation_type } = body;

  if (!Number.isInteger(patient_id) || patient_id <= 0) {
    fail('patient_id must be a positive integer');
  }

  const doctorName = checkName(doctor_name, 'doctor_name');

  if (typeof scheduled_at !== 'string' || Number.isNaN(Date.parse(scheduled_at))) {
    fail('scheduled_at must be a valid ISO 8601 date');
  }
  const scheduledAt = new Date(scheduled_at);
  if (scheduledAt <= new Date()) {
    fail('scheduled_at must be in the future');
  }

  if (
    !Number.isInteger(duration_minutes) ||
    duration_minutes < MIN_DURATION ||
    duration_minutes > MAX_DURATION
  ) {
    fail(`duration_minutes must be an integer between ${MIN_DURATION} and ${MAX_DURATION}`);
  }

  if (!CONSULTATION_TYPES.includes(consultation_type)) {
    fail(`consultation_type must be one of: ${CONSULTATION_TYPES.join(', ')}`);
  }

  return {
    patient_id,
    doctor_name: doctorName,
    scheduled_at: scheduledAt,
    duration_minutes,
    consultation_type,
  };
}

const UPDATABLE_FIELDS = ['scheduled_at', 'duration_minutes', 'status'];
const STATUSES = ['scheduled', 'cancelled', 'completed', 'no_show'];

export function validateAppointmentUpdate(body) {
  if (!body || Object.keys(body).length === 0) {
    fail('Request body must contain at least one field to update');
  }

  for (const field of Object.keys(body)) {
    if (!UPDATABLE_FIELDS.includes(field)) {
      fail(`${field} cannot be updated`);
    }
  }

  const changes = {};

  if (body.scheduled_at !== undefined) {
    if (typeof body.scheduled_at !== 'string' || Number.isNaN(Date.parse(body.scheduled_at))) {
      fail('scheduled_at must be a valid ISO 8601 date');
    }
    const scheduledAt = new Date(body.scheduled_at);
    if (scheduledAt <= new Date()) fail('scheduled_at must be in the future');
    changes.scheduled_at = scheduledAt;
  }

  if (body.duration_minutes !== undefined) {
    if (
      !Number.isInteger(body.duration_minutes) ||
      body.duration_minutes < MIN_DURATION ||
      body.duration_minutes > MAX_DURATION
    ) {
      fail(`duration_minutes must be an integer between ${MIN_DURATION} and ${MAX_DURATION}`);
    }
    changes.duration_minutes = body.duration_minutes;
  }

  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) {
      fail(`status must be one of: ${STATUSES.join(', ')}`);
    }
    changes.status = body.status;
  }

  return changes;
}