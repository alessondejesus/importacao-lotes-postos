import fs from 'fs';
import {parse} from 'csv-parse';
import {ImportGasStationResponseType} from "../../types/import-gas-station-response-type";

export class ImportGasStationService {
  private readonly COLUMNS = [
    {name: 'cnpj', required: true},
    {name: 'nome_posto', required: true},
    {name: 'nome_fantasia', required: true},
    {name: 'bandeira', required: true},
    {name: 'logradouro', required: true},
    {name: 'numero', required: true},
    {name: 'complemento', required: false},
    {name: 'bairro', required: true},
    {name: 'municipio', required: true},
    {name: 'uf', required: true},
    {name: 'cep', required: true},
    {name: 'cpf_responsavel', required: true},
    {name: 'nome_responsavel', required: true},
    {name: 'email_responsavel', required: true},
    {name: 'cargo_responsavel', required: true},
    {name: 'combustiveis', required: true},
    {name: 'status', required: true},
    {name: 'data_inauguracao', required: true},
    {name: 'numero_bicos', required: true},
    {name: 'numero_pistas', required: true},
    {name: 'observacoes', required: false},
  ];

  async execute(filePath: string): Promise<ImportGasStationResponseType> {
    const errors: string[] = [];
    const data: any[] = [];
    let rowCount = 0;
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
            errors.push(`erro nos cabeçalhos: colunas obrigatórias ausentes: ${missing.map(m => m.name).join(', ')}`);
            parser.destroy();
            return;
          }
          headersValidated = true;
        }

        const rowErrors: string[] = [];
        for (const col of this.COLUMNS) {
          const value = row[col.name];
          if (col.required && (value === null || value === undefined || value === '')) {
            rowErrors.push(`coluna ${col.name} vazia`);
          }
        }

        if (rowErrors.length > 0) {
          errors.push(`linha ${rowCount + 1}: ${rowErrors.join(', ')}`);
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

        let success: boolean = errors.length === 0;
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
