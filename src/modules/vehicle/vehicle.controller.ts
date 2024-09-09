import { Controller, Get } from '@nestjs/common';
import { VehicleService } from './vehicle.service';

@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  // Endpoint to fetch vehicle data from the external API and store it in MongoDB
  @Get('fetch')
  async fetchVehicles() {
    await this.vehicleService.fetchAndStoreVehicleData();
    return { message: 'Vehicle data fetched and stored successfully' };
  }
}
