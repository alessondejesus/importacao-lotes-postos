import { Router } from 'express';
import multer from 'multer';
import { GasStationController } from '../controllers/gas-station.controller';

const upload = multer({ dest: 'uploads/' });
const router = Router();
const gasStationController = new GasStationController();

router.post('/import', upload.single('file'), (req, res) => gasStationController.import(req, res));

export default router;
