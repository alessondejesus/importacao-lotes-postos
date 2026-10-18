import {Request, Response} from 'express';
import {ImportGasStationService} from "../services/gas-station/import-gas-station.service";
import {successResponse, errorResponse} from "../utils /api-response-util";
import fs from 'fs/promises';

const importGasStationService = new ImportGasStationService();

export class GasStationController {
  async import(req: Request, res: Response): Promise<void> {
    try {
      const result = await importGasStationService.execute(req.file!.path);

      if (!result.success) {
        errorResponse(res, result.message, 422, result.errors);
        return;
      }

      successResponse(res, result.message);
    } catch (error) {
      if (req.file) {
        console.log(req.file.path);
        await fs.unlink(req.file.path).catch(() => {
        });
      }
      console.error(error);
      errorResponse(res, 'não foi possível processar a planilha. Verifique os dados e tente novamente. Se persistir, contate o administrador.', 500);
    }
  }
}
