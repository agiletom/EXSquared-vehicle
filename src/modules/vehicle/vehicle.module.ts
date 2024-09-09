import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Vehicle, VehicleSchema } from './entities/vehicle.schema';
import { VehicleService } from './vehicle.service';
import { VehicleResolver } from '../../graphql/vehicle.resolver';
import { CommonModule } from '../../common/common.module';
import { VehicleController } from './vehicle.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vehicle.name, schema: VehicleSchema }]),
    CommonModule,
  ],
  providers: [VehicleService, VehicleResolver],
  controllers: [VehicleController],
})
export class VehicleModule {}
