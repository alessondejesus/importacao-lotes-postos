import fs from 'fs';
import {parse} from 'csv-parse';
import {ImportGasStationResponseType} from "../../types/import-gas-station-response-type";

export class ImportGasStationService {
  private readonly COLUMNS = [
    'cnpj',
    'nome_posto',
    'nome_fantasia',
    'bandeira',
    'logradouro',
    'numero',
    'complemento',
    'bairro',
    'municipio',
    'uf',
    'cep',
    'cpf_responsavel',
    'nome_responsavel',
    'email_responsavel',
    'cargo_responsavel',
    'combustiveis',
    'status',
    'data_inauguracao',
    'numero_bicos',
    'numero_pistas',
    'observacoes',
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
          const missing = this.COLUMNS.filter(col => !headers.includes(col));
          if (missing.length > 0) {
            errors.push(`erro nos cabeçalhos: colunas obrigatórias ausentes: ${missing.join(', ')}`);
            parser.destroy();
            return;
          }
          headersValidated = true;
        }

        //TODO: adicionar validacoes required aqui obs: desenvolver a validacao de formato de campos
        const rowErrors: string[] = [];
        for (const col of this.COLUMNS) {
          if (!row[col]) {
            rowErrors.push(`coluna ${col} vazia`);
          }
        }

        if (rowErrors.length > 0) {
          errors.push(`linha ${rowCount + 1}: ${rowErrors.join(', ')}`);
        } else {
          data.push(row);
        }
      });

      parser.on('error', (error) => {
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
