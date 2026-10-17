import 'dotenv/config';
import app from './app';
import {db} from './database/connection';

const port = process.env.PORT || 3000;

async function startServer() {
  try {
    await db.query('SELECT 1');
  } catch (error) {
    console.error('database connection failed:', error);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`server running on port ${port}`);
  });
}

startServer();