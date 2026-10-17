export class GasStationImportService {
  async importData(data: any): Promise<{ success: boolean; count: number }> {
    console.log('Importing data:', data);
    return {
      success: true,
      count: Array.isArray(data) ? data.length : 1
    };
  }
}
