import app from './app.js';
import config from './config.js';
import pool from './db/pool.js';

const port = config.port;

try {
  await pool.query('SELECT 1');
  console.log('Connected to PostgreSQL');
} catch (err) {
  console.error('Cannot connect to PostgreSQL:', err.message);
  process.exit(1);
};

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});