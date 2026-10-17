import 'dotenv/config';
import express from 'express';

const app = express();
const port = process.env.APP_PORT || 3000;

app.get('/', (req, res) => {
  res.json({message: 'server is live'});
});

app.listen(port, () => {
console.log(`server running at http://localhost:${port}`);});