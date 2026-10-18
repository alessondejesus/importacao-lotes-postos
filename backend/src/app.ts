import express from 'express';
import cors from 'cors';
import gasStationRoutes from './routes/gas-station.routes';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'server is live' });
});

app.use('/gas-stations', gasStationRoutes);

export default app;
