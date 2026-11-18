import { readFile } from 'node:fs/promises';
import pool from '../../src/db/pool.js';

export default async function resetDatabase() {
  const schema = await readFile(new URL('../../db/schema.sql', import.meta.url), 'utf8');
  const seed = await readFile(new URL('../../db/seed.sql', import.meta.url), 'utf8');
  await pool.query(schema);
  await pool.query(seed);
}
