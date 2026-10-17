import {Request, Response} from 'express';
import {GasStationImportService} from '../services/gas-station-import.service';

const gasStationImportService = new GasStationImportService();

export class GasStationController {
  async import(req: Request, res: Response): Promise<void> {
    try {
      const result = await gasStationImportService.importData(req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({error: 'Internal Server Error'});
    }
  }
}
