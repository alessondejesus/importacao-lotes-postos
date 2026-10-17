import fs from 'fs';
import {parse} from 'csv-parse';
import {ImportGasStationResponseType} from "../../types/import-gas-station-response-type";
import {isValidCNPJ} from "../../validators/cnpj_validator";
import {isValidCPF} from "../../validators/cpf_validator";
import {isValidCEP} from "../../validators/cep_validator";
import {isValidEmail} from "../../validators/email_validator";
import {isValidDate} from "../../validators/gas-station-import/date_validator";
import {isValidGasStationStatus} from "../../validators/gas-station-import/gas_station_status_validator";
import {getInvalidFuels, isValidFuelList} from "../../validators/gas-station-import/fuel_type_validator";

export class ImportGasStationService {
  private readonly COLUMNS = [
    {name: 'cnpj', required: true, validate: isValidCNPJ},
    {name: 'nome_posto', required: true, maxLength: 150},
    {name: 'nome_fantasia', required: true, maxLength: 150},
    {name: 'bandeira', required: true, maxLength: 150},
    {name: 'logradouro', required: true, maxLength: 150},
    {name: 'numero', required: true, maxLength: 150},
    {name: 'complemento', required: false, maxLength: 150},
    {name: 'bairro', required: true, maxLength: 150},
    {name: 'municipio', required: true, maxLength: 150},
    {name: 'uf', required: true, maxLength: 2},
    {name: 'cep', required: true, validate: isValidCEP},
    {name: 'cpf_responsavel', required: true, validate: isValidCPF},
    {name: 'nome_responsavel', required: true, maxLength: 150},
    {name: 'email_responsavel', required: true, validate: isValidEmail},
    {name: 'cargo_responsavel', required: true, maxLength: 150},
    {name: 'combustiveis', required: true, validate: isValidFuelList},
    {name: 'status', required: true, validate: isValidGasStationStatus},
    {name: 'data_inauguracao', required: true, validate: isValidDate},
    {name: 'numero_bicos', required: true},
    {name: 'numero_pistas', required: true},
    {name: 'observacoes', required: false},
  ];

  async execute(filePath: string): Promise<ImportGasStationResponseType> {
    const errors: string[] = [];
    const data: any[] = [];
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
                rowErrors.push(`coluna ${col.name} possui formato inválido`);
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
          data.push(row);
        }
      });

      parser.on('error', (error) => {
        fs.unlink(filePath, () => {
        });
        reject(error);
      });

      parser.on('end', () => {
        fs.unlink(filePath, (error) => {
          if (error) console.error('erro ao remover arquivo temporário:', error);
        });

        if (totalErrors > MAX_ERRORS) {
          errors.push(`a planilha contém mais ${totalErrors - MAX_ERRORS} erro(s) que precisa(m) ser corrigido(s). Importe novamente após corrigir os erros listados acima.`);
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
