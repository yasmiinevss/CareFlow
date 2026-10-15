import { AppError } from '../utils/AppError.js';

const ALLOWED_TRANSITIONS = {
  scheduled: ['cancelled', 'completed', 'no_show'],
  cancelled: [],
  completed: [],
  no_show: [],
};

export function assertUpdateAllowed(currentStatus, changes) {
  const allowed = ALLOWED_TRANSITIONS[currentStatus];

  if (allowed.length === 0) {
    throw new AppError(
      409,
      'INVALID_TRANSITION',
      `Appointment is ${currentStatus} and can no longer be modified`
    );
  }

  if (changes.status && !allowed.includes(changes.status)) {
    throw new AppError(
      409,
      'INVALID_TRANSITION',
      `Cannot change status from ${currentStatus} to ${changes.status}`
    );
  }
}