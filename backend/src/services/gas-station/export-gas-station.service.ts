import {Transform, TransformCallback} from 'stream';
import {GasStationRepository} from '../../repositories/gas-station.repository';
import {gasStationExportCSVColumnsNames} from "../../constants/gas-station-constant";
import {
  escapeCSV,
  formatCEP,
  formatCNPJ,
  formatCPF,
  formatDate,
  formatFuels,
  formatStatus
} from "../../utils/export-gas-station-csv-util";

export class ExportGasStationService {
  private readonly repository: GasStationRepository;

  constructor() {
    this.repository = new GasStationRepository();
  }

  async execute(): Promise<{ stream: Transform; release: () => void }> {
    const {stream: dbStream, release} = await this.repository.getGasStationsStream();

    let isFirstChunk = true;

    const transformer = new Transform({
      objectMode: true,
      writableObjectMode: true,
      transform(row: any, encoding: BufferEncoding, callback: TransformCallback) {
        try {
          if (isFirstChunk) {
            this.push(gasStationExportCSVColumnsNames.join(';') + '\n');
            isFirstChunk = false;
          }

          const formattedRow = [
            formatCNPJ(row.cnpj),
            escapeCSV(row.name),
            escapeCSV(row.trade_name),
            escapeCSV(row.brand),
            escapeCSV(row.street),
            escapeCSV(row.number),
            escapeCSV(row.complement),
            escapeCSV(row.neighborhood),
            escapeCSV(row.city),
            escapeCSV(row.state),
            formatCEP(row.zip_code),
            formatCPF(row.responsible_cpf),
            escapeCSV(row.responsible_name),
            escapeCSV(row.responsible_email),
            escapeCSV(row.responsible_position),
            formatFuels(row.fuels),
            formatStatus(row.status),
            formatDate(row.founding_date),
            row.pump_count,
            row.lane_count,
            escapeCSV(row.observations),
          ];

          callback(null, formattedRow.join(';') + '\n');
        } catch (error: any) {
          callback(error);
        }
      }
    });

    dbStream.pipe(transformer);
    return {stream: transformer, release};
  }
}
