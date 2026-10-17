import {Request, Response} from 'express';
import {ImportGasStationService} from "../services/gas-station/import-gas-station.service";

const importGasStationService = new ImportGasStationService();

export class GasStationController {
  async import(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({error: 'arquivo CSV não enviado'});
        return;
      }

      const result = await importGasStationService.execute(req.file.path);

      if (!result.success && result.errors.length > 0) {
        res.status(422).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({error: 'internal Server Error'});
    }
  }
}
