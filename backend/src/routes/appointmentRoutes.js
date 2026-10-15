import { Router } from 'express';
import { listAppointments } from '../controllers/appointmentController.js';
import { getAppointmentById } from '../controllers/appointmentController.js';
import { createAppointment } from '../controllers/appointmentController.js';
import { updateAppointment } from '../controllers/appointmentController.js';
const router = Router();

router.get('/', listAppointments);
router.get('/:id', getAppointmentById);
router.post('/', createAppointment);
router.patch('/:id', updateAppointment);
export default router;