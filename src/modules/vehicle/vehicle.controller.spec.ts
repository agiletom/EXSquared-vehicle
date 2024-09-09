import { Test, TestingModule } from '@nestjs/testing';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';

describe('VehicleController', () => {
  let controller: VehicleController;
  let service: VehicleService;

  const mockVehicleService = {
    fetchAndStoreVehicleData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [
        {
          provide: VehicleService,
          useValue: mockVehicleService,
        },
      ],
    }).compile();

    controller = module.get<VehicleController>(VehicleController);
    service = module.get<VehicleService>(VehicleService);
  });

  test('should call fetchAndStoreVehicleData method in service', async () => {
    await controller.fetchVehicles();
    expect(service.fetchAndStoreVehicleData).toHaveBeenCalled();
  });
});
