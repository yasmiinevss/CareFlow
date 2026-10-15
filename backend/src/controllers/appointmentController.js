import * as appointmentRepository from '../repositories/appointmentRepository.js';
import {AppError} from '../utils/AppError.js';
import { validateNewAppointment, validateAppointmentUpdate } from '../validators/appointmentsValidator.js';
import * as appointmentService from '../services/appointmentService.js';

export async function listAppointments(req, res) {
  const appointments = await appointmentRepository.findAll();
  res.json(appointments);
}

export async function getAppointmentById(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
  throw new AppError(400, 'VALIDATION_ERROR', 'Appointment id must be a positive integer');
}
  const appointment = await appointmentRepository.findById(id);
  if (!appointment) {
    throw new AppError(404, 'NOT_FOUND', `Appointment with ID ${id} not found`);
  }
  res.json(appointment);
}   

export async function createAppointment(req, res) {
  const data = validateNewAppointment(req.body);
  const appointment = await appointmentService.createAppointment(data);
  res.status(201).json(appointment);
}

export async function updateAppointment(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Appointment id must be a positive integer');
  }
  const changes = validateAppointmentUpdate(req.body);
  const updatedAppointment = await appointmentService.updateAppointment(id, changes);
  res.json(updatedAppointment);
}