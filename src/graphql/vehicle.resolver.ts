import { Resolver, Query, Args } from '@nestjs/graphql';
import { VehicleService } from '../modules/vehicle/vehicle.service';
import { Vehicle } from '../modules/vehicle/entities/vehicle.schema';

@Resolver(() => Vehicle)
export class VehicleResolver {
  constructor(private readonly vehicleService: VehicleService) {}

  @Query(() => [Vehicle])
  async getVehicles(
    @Args('makeName', { type: () => String, nullable: true }) makeName?: string,
    @Args('limit', { type: () => Number, nullable: true, defaultValue: 10 })
    limit = 10,
    @Args('offset', { type: () => Number, nullable: true, defaultValue: 0 })
    offset = 0,
  ): Promise<Vehicle[]> {
    return this.vehicleService.getVehicles(makeName, limit, offset);
  }
}
