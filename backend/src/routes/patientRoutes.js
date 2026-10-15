import {Router} from 'express';
import { listPatients } from '../controllers/patientController.js';
import { getPatientById } from '../controllers/patientController.js';
import { createPatient } from '../controllers/patientController.js';
const router = Router();

router.get('/', listPatients);
router.get('/:id', getPatientById);
router.post('/', createPatient);


export default router;