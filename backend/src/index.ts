import 'dotenv/config';
import app from './app';
import {db} from './database/connection';
import {runMigrations} from './database/migrate';

const port = process.env.PORT || 3000;

async function startServer() {
  try {
    await db.query('SELECT 1');
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`server running on port ${port}`);
  });
}

startServer();