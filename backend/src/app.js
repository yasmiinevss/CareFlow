import express from 'express';
import appointmentRoutes from './routes/appointmentRoutes.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import patientRoutes from './routes/patientRoutes.js';
const app = express();
app.disable('x-powered-by');
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Hello World!' });
});

app.use('/api/appointments', appointmentRoutes);
app.use('/api/patients', patientRoutes);

app.use(notFound);
app.use(errorHandler);


export default app;