import {PoolClient} from 'pg';
import {db} from '../database/connection';
import {GasStationType} from '../types/gas-station';
import {stationGasStationTableColumns} from "../constants/gas-station.-constant";

export class GasStationRepository {
  private readonly BATCH_SIZE = 500;

  async saveMany(gasStations: GasStationType[]): Promise<void> {
    const client = await db.connect();

    try {
      await client.query('BEGIN');

      for (let i = 0; i < gasStations.length; i += this.BATCH_SIZE) {
        const batch = gasStations.slice(i, i + this.BATCH_SIZE);
        await this.processBatch(client, batch);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async processBatch(client: PoolClient, batch: GasStationType[]): Promise<void> {
    if (batch.length === 0) return;

    const values: any[] = [];
    const placeholders: string[] = [];
    const stationColumns = stationGasStationTableColumns;

    batch.forEach((station, index) => {
      const offset = index * stationColumns.length;
      const rowPlaceholders = stationColumns.map((_, j) => `$${offset + j + 1}`);
      placeholders.push(`(${rowPlaceholders.join(', ')})`);

      values.push(
        station.cnpj,
        station.name,
        station.tradeName,
        station.brand,
        station.street,
        station.number,
        station.complement,
        station.neighborhood,
        station.city,
        station.state,
        station.zipCode,
        station.responsibleCpf,
        station.responsibleName,
        station.responsibleEmail,
        station.responsiblePosition,
        station.status,
        station.foundingDate,
        station.pumpCount,
        station.laneCount,
        station.observations
      );
    });

    const stationQuery = `
        INSERT INTO gas_stations (${stationColumns.join(', ')})
        VALUES ${placeholders.join(', ')} ON CONFLICT (cnpj) DO NOTHING
      RETURNING id, cnpj
    `;

    const result = await client.query(stationQuery, values);

    if (result.rows.length > 0) {
      const insertedStationsMap = new Map<string, string>();
      result.rows.forEach(row => {
        insertedStationsMap.set(row.cnpj, row.id);
      });

      const fuelValues: any[] = [];
      const fuelPlaceholders: string[] = [];
      let fuelParamIndex = 1;

      batch.forEach(station => {
        const stationId = insertedStationsMap.get(station.cnpj);
        if (stationId) {
          station.fuels.forEach(fuel => {
            fuelPlaceholders.push(`($${fuelParamIndex++}, $${fuelParamIndex++})`);
            fuelValues.push(stationId, fuel);
          });
        }
      });

      if (fuelPlaceholders.length > 0) {
        const fuelQuery = `
            INSERT INTO gas_station_fuels (gas_station_id, fuel_type)
            VALUES ${fuelPlaceholders.join(', ')} ON CONFLICT DO NOTHING
        `;
        await client.query(fuelQuery, fuelValues);
      }
    }
  }
}
