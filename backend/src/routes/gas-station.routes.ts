import {Router} from 'express';
import multer from 'multer';
import {GasStationController} from '../controllers/gas-station.controller';
import {validateImportGasStation} from "../middlewares/validate-import-gas-station";
import * as os from "node:os";

const upload = multer({dest: os.tmpdir()});
const router = Router();
const gasStationController = new GasStationController();

router.post(
  '/import',
  upload.single('file'),
  validateImportGasStation,
  (req, res) => gasStationController.import(req, res)
);

export default router;
