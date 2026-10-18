import fs from 'fs';
import {parse} from 'csv-parse';
import {ImportGasStationResponseType} from "../../types/import-gas-station-response";
import {getInvalidFuels} from "../../validators/gas-station-import/fuel_type_validator";
import {GasStationType} from "../../types/gas-station";
import {GasStationRepository} from "../../repositories/gas-station.repository";
import {parseFuelType} from "../../enums/gas-station-fuel-type-enum";
import {parseStatus} from "../../enums/gas-station-status-enum";
import {stationGasStationImportCSVColumns} from "../../constants/gas-station.-constant";
import {formatDate} from "../../utils /format-date-util";

export class ImportGasStationService {
  private readonly repository: GasStationRepository;

  constructor() {
    this.repository = new GasStationRepository();
  }

  private readonly COLUMNS = stationGasStationImportCSVColumns;

  async execute(filePath: string): Promise<ImportGasStationResponseType> {
    const errors: string[] = [];
    const data: GasStationType[] = [];
    let rowCount = 0;
    let totalErrors = 0;
    const MAX_ERRORS = 50;
    let headersValidated = false;

    return new Promise((resolve, reject) => {
      const parser = fs.createReadStream(filePath).pipe(
        parse({
          delimiter: ',', // TODO: teste local com ',' por conta do metodo exportacao Google Sheet, testes feito com csv de 252313 linhas, alterar pra ';' em prod
          columns: true,
          skip_empty_lines: true,
          trim: true,
        })
      );

      parser.on('data', (row) => {
        rowCount++;

        if (!headersValidated) {
          const headers = Object.keys(row);
          const missing = this.COLUMNS.filter(col => !headers.includes(col.name));
          if (missing.length > 0) {
            const errorMsg = `erro nos cabeçalhos: colunas obrigatórias ausentes: ${missing.map(m => m.name).join(', ')}`;
            errors.push(errorMsg);
            parser.destroy();
            return;
          }
          headersValidated = true;
        }

        const rowErrors: string[] = [];
        for (const col of (this.COLUMNS as any[])) {
          const value = row[col.name];
          const isEmpty = value === null || value === undefined || value === '';

          if (col.required && isEmpty) {
            rowErrors.push(`coluna ${col.name} é obrigatória`);
            continue;
          }

          if (!isEmpty) {
            if (col.maxLength && String(value).length > col.maxLength) {
              rowErrors.push(`coluna ${col.name} excede o limite de ${col.maxLength} caracteres`);
            }

            if (col.validate && !col.validate(value)) {
              if (col.name === 'combustiveis') {
                const invalidFuels = getInvalidFuels(value);
                rowErrors.push(`coluna ${col.name} possui combustíveis inválidos: ${invalidFuels.join(', ')}`);
              } else {
                rowErrors.push(`coluna ${col.name} possui valor inválido: ${value}`);
              }
            }
          }
        }

        if (rowErrors.length > 0) {
          totalErrors++;
          if (errors.length < MAX_ERRORS) {
            errors.push(`linha ${rowCount + 1}: ${rowErrors.join('; ')}`);
          }
        } else {
          data.push({
            cnpj: row.cnpj.trim().replace(/\D/g, ''),
            name: row.nome_posto.trim(),
            tradeName: row.nome_fantasia?.trim(),
            brand: row.bandeira.trim(),
            street: row.logradouro.trim(),
            number: row.numero?.trim(),
            complement: row.complemento?.trim() || null,
            neighborhood: row.bairro.trim(),
            city: row.municipio.trim(),
            state: row.uf.trim(),
            zipCode: row.cep.trim().replace(/\D/g, ''),
            responsibleCpf: row.cpf_responsavel.trim().replace(/\D/g, ''),
            responsibleName: row.nome_responsavel.trim(),
            responsibleEmail: row.email_responsavel?.trim(),
            responsiblePosition: row.cargo_responsavel?.trim(),
            fuels: row.combustiveis.split(',').map((f: string) => parseFuelType(f.trim())).filter((f: any) => f !== null) || [],
            status: parseStatus(row.status)!,
            foundingDate: formatDate(row.data_inauguracao, 'dd/MM/yyyy', 'yyyy-MM-dd'),
            pumpCount: Number(row.numero_bicos),
            laneCount: Number(row.numero_pistas),
            observations: row.observacoes?.trim() || null,
          });
        }
      });

      parser.on('error', (error) => {
        fs.unlink(filePath, () => {
        });
        reject(error);
      });

      parser.on('end', async () => {
        fs.unlink(filePath, (error) => {
          if (error) console.error('erro ao remover arquivo temporário:', error);
        });

        if (totalErrors > MAX_ERRORS) {
          errors.push(`a planilha contém mais ${totalErrors - MAX_ERRORS} erro(s) que precisa(m) ser corrigido(s). Importe novamente após corrigir os erros listados acima.`);
        }

        if (totalErrors === 0 && data.length > 0) {
          try {
            await this.repository.saveMany(data);
          } catch (error: any) {
            return reject(error);
          }
        }

        let success: boolean = totalErrors === 0;
        let message: string = success ? 'planilha importada com sucesso' : 'erro ao importar planilha';

        resolve({
          success: success,
          message: message,
          errors,
        });
      });

      parser.on('close', () => {
        if (!headersValidated && errors.length > 0) {
          fs.unlink(filePath, () => {
          });
          resolve({
            success: false,
            message: 'erro ao importar planilha',
            errors,
          });
        }
      });
    });
  }
}
