import { db } from './connection';
import fs from 'node:fs';
import path from 'node:path';

async function migrate() {
  const migrationsDir = path.join(__dirname, 'migrations');

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    for (const file of files) {
      const { rows } = await db.query(
        'SELECT id FROM migrations WHERE name = $1',
        [file],
      );

      if (rows.length > 0) continue;

      const sql = fs.readFileSync(
        path.join(migrationsDir, file),
        'utf-8',
      );

      const client = await db.connect();

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [file],
        );
        await client.query('COMMIT');

        console.log(`migration executed: ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }
  } finally {
    await db.end();
  }
}

migrate().catch((error) => {
  console.error('migration failed:', error);
  process.exitCode = 1;
});