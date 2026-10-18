import {Request, Response} from 'express';
import {ImportGasStationService} from "../services/gas-station/import-gas-station.service";
import {ExportGasStationService} from "../services/gas-station/export-gas-station.service";
import {ListGasStationService} from "../services/gas-station/list-gas-station.service";
import {successResponse, errorResponse} from "../utils/api-response-util";
import fs from 'fs/promises';

const importGasStationService = new ImportGasStationService();
const exportGasStationService = new ExportGasStationService();
const listGasStationService = new ListGasStationService();

export class GasStationController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const {lastId, search} = req.query;

      const result = await listGasStationService.execute({
        lastId: lastId ? Number(lastId) : undefined,
        search: search ? String(search) : undefined,
      });

      successResponse(res, 'postos listados com sucesso', result);
    } catch (error) {
      console.error(error);
      errorResponse(res, 'não foi possível listar os postos de combustível.', 500);
    }
  }

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

  async export(req: Request, res: Response): Promise<void> {
    try {
      const {stream, release} = await exportGasStationService.execute();

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=postos-de-combustivel.csv');

      stream.pipe(res);

      stream.on('end', () => {
        release();
      });

      stream.on('error', (error) => {
        console.error('erro no stream de exportação:', error);
        release();
        if (!res.headersSent) {
          errorResponse(res, 'não foi possível gerar a exportação da planilha. Verifique os dados e tente novamente. Se persistir, contate o administrador.', 500);
        }
      });
    } catch (error) {
      console.error(error);
      errorResponse(res, 'não foi possível gerar a exportação da planilha. Verifique os dados e tente novamente. Se persistir, contate o administrador.', 500);
    }
  }
}
