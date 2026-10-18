import {PoolClient} from 'pg';
import QueryStream from 'pg-query-stream';
import {db} from '../database/connection';
import {GasStationType} from '../types/gas-station';
import {stationGasStationTableColumns} from "../constants/gas-station-constant";

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

  async getGasStationsStream(): Promise<{ stream: QueryStream; release: () => void; client: PoolClient }> {
    const client = await db.connect();
    const query = `
        SELECT
            gs.cnpj,
            gs.name,
            gs.trade_name,
            gs.brand,
            gs.street,
            gs.number,
            gs.complement,
            gs.neighborhood,
            gs.city,
            gs.state,
            gs.zip_code,
            gs.responsible_cpf,
            gs.responsible_name,
            gs.responsible_email,
            gs.responsible_position,
            gs.status,
            gs.founding_date,
            gs.pump_count,
            gs.lane_count,
            gs.observations,
            COALESCE(
                STRING_AGG(gsf.fuel_type::TEXT, ',' ORDER BY gsf.fuel_type),
                ''
            ) AS fuels
        FROM gas_stations gs
        LEFT JOIN gas_station_fuels gsf ON gs.id = gsf.gas_station_id
        GROUP BY gs.id
        ORDER BY gs.id ASC
    `;
    const stream = new QueryStream(query);
    const queryStream = client.query(stream);

    return {
      stream: queryStream,
      release: () => client.release(),
      client
    };
  }

  async list(params: {
    limit: number;
    lastId?: number | undefined;
    search?: string | undefined;
  }): Promise<any[]> {
    const {limit, lastId, search} = params;
    const values: any[] = [limit];
    let query = `
        SELECT
            gs.id,
            gs.cnpj,
            gs.name,
            gs.trade_name,
            gs.brand,
            gs.street,
            gs.number,
            gs.complement,
            gs.neighborhood,
            gs.city,
            gs.state,
            gs.zip_code,
            gs.responsible_cpf,
            gs.responsible_name,
            gs.responsible_email,
            gs.responsible_position,
            gs.status,
            gs.founding_date,
            gs.pump_count,
            gs.lane_count,
            gs.observations,
            COALESCE(
                STRING_AGG(gsf.fuel_type::TEXT, ',' ORDER BY gsf.fuel_type),
                ''
            ) AS fuels
        FROM gas_stations gs
        LEFT JOIN gas_station_fuels gsf ON gs.id = gsf.gas_station_id
        WHERE 1=1
    `;

    if (lastId) {
      values.push(lastId);
      query += ` AND gs.id > $${values.length}`;
    }

    if (search) {
      const cleanSearch = search.replace(/\D/g, '');
      values.push(`%${search}%`);
      const searchIndex = values.length;

      if (cleanSearch && cleanSearch.length > 0) {
        values.push(`%${cleanSearch}%`);
        const cleanSearchIndex = values.length;
        query += ` AND (gs.cnpj LIKE $${cleanSearchIndex} OR gs.trade_name ILIKE $${searchIndex})`;
      } else {
        query += ` AND gs.name ILIKE $${searchIndex}`;
      }
    }

    query += `
        GROUP BY gs.id
        ORDER BY gs.id ASC
        LIMIT $1
    `;

    const result = await db.query(query, values);
    return result.rows.map(row => ({
      ...row,
      fuels: row.fuels ? row.fuels.split(',') : []
    }));
  }
}
