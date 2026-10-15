import * as patientRepository from '../repositories/patientRepository.js';
import {AppError} from '../utils/AppError.js';
import {validatePatient} from '../validators/patientValidator.js';
export async function listPatients(req, res) {
  const patients = await patientRepository.findAll();
  res.json(patients);
}

export async function getPatientById(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Patient id must be a positive integer');
  }
  const patient = await patientRepository.findById(id);
  if (!patient) {
    throw new AppError(404, 'NOT_FOUND', `Patient with ID ${id} not found`);
  }
  res.json(patient);
}

export async function createPatient(req, res) {
  const { first_name, last_name } = validatePatient(req.body);
  const newPatient = await patientRepository.createPatient(first_name, last_name);
  res.status(201).json(newPatient);
}