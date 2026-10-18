import {Request, Response, NextFunction} from 'express';
import {errorResponse} from "../utils/api-response-util";

export function validateImportGasStation(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const file = req.file;

  if (!file) {
    errorResponse(res, 'arquivo CSV não enviado', 400);
    return;
  }

  if (
    file.mimetype !== 'text/csv' &&
    !file.originalname.toLowerCase().endsWith('.csv')
  ) {
    errorResponse(res, 'formato inválido, arquivo deve ser .csv', 400);
    return;
  }

  next();
}