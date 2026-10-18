import {GasStationRepository} from "../../repositories/gas-station.repository";

export class ListGasStationService {
  private readonly repository: GasStationRepository;

  constructor() {
    this.repository = new GasStationRepository();
  }

  async execute(params: {
    lastId?: number | undefined;
    search?: string | undefined;
  }) {
    const limit = 10;
    const gasStations = await this.repository.list({
      limit,
      lastId: params.lastId,
      search: params.search,
    });

    const hasMore = gasStations.length === limit;
    const nextLastId = hasMore ? Number(gasStations[gasStations.length - 1].id) : null;

    return {
      items: gasStations,
      pagination: {
        lastId: nextLastId,
        hasMore,
      }
    };
  }
}
