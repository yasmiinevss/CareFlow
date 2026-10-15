import {AppError} from '../utils/AppError.js';

const MAX_NAME_LENGTH = 100;

export function checkName(value, fieldName) {
  if (typeof value !== 'string') {
    throw new AppError(400, 'VALIDATION_ERROR', `${fieldName} must be a string`);
  }

  const trimmed = value.trim();

  if (trimmed === '') {
    throw new AppError(400, 'VALIDATION_ERROR', `${fieldName} is required`);
  }

  if (trimmed.length > MAX_NAME_LENGTH) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      `${fieldName} must be at most ${MAX_NAME_LENGTH} characters`
    );
  }

  if (/\d/.test(trimmed)) {
    throw new AppError(400, 'VALIDATION_ERROR', `${fieldName} must not contain digits`);
  }

  return trimmed;
}

export  function validatePatient(body) {
  if (!body) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Request body is required');
  }

  return {
    last_name: checkName(body.last_name, 'last_name'),
    first_name: checkName(body.first_name, 'first_name'),
  };
}

