import { Router } from 'express';
import { GasStationController } from '../controllers/gas-station.controller';

const router = Router();
const gasStationController = new GasStationController();

router.post('/import', (req, res) => gasStationController.import(req, res));

export default router;
