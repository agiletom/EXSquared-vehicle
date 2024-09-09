import { Test, TestingModule } from '@nestjs/testing';
import { VehicleResolver } from './vehicle.resolver';
import { VehicleService } from '../modules/vehicle/vehicle.service';

describe('VehicleResolver', () => {
  let resolver: VehicleResolver;

  const mockService = {
    getVehicles: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleResolver,
        {
          provide: VehicleService,
          useValue: mockService,
        },
      ],
    }).compile();

    resolver = module.get<VehicleResolver>(VehicleResolver);
  });

  test('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getVehicles', () => {
    const vehicles = [
      { makeId: '12858', makeName: 'Toyota', vehicleTypes: [] },
    ];

    beforeEach(() => {
      mockService.getVehicles.mockResolvedValue(vehicles);
    });

    test('should return vehicles from the service without args', async () => {
      const result = await resolver.getVehicles();
      expect(result).toEqual(vehicles);
      expect(mockService.getVehicles).toHaveBeenCalledWith(undefined, 10, 0);
    });

    test('should return vehicles from the service with makeName', async () => {
      const result = await resolver.getVehicles('Toyota');
      expect(result).toEqual(vehicles);
      expect(mockService.getVehicles).toHaveBeenCalledWith('Toyota', 10, 0);
    });

    test('should return vehicles from the service with limit and offset', async () => {
      const result = await resolver.getVehicles(undefined, 5, 2);
      expect(result).toEqual(vehicles);
      expect(mockService.getVehicles).toHaveBeenCalledWith(undefined, 5, 2);
    });

    test('should return vehicles from the service with makeName, limit, and offset', async () => {
      const result = await resolver.getVehicles('Honda', 3, 1);
      expect(result).toEqual(vehicles);
      expect(mockService.getVehicles).toHaveBeenCalledWith('Honda', 3, 1);
    });

    test('should handle an empty string makeName', async () => {
      const result = await resolver.getVehicles('');
      expect(result).toEqual(vehicles);
      expect(mockService.getVehicles).toHaveBeenCalledWith('', 10, 0);
    });

    test('should handle null makeName', async () => {
      const result = await resolver.getVehicles(null);
      expect(result).toEqual(vehicles);
      expect(mockService.getVehicles).toHaveBeenCalledWith(undefined, 10, 0);
    });

    test('should handle undefined makeName, limit, and offset', async () => {
      const result = await resolver.getVehicles(
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual(vehicles);
      expect(mockService.getVehicles).toHaveBeenCalledWith(undefined, 10, 0);
    });

    test('should return empty array when no vehicles are found', async () => {
      mockService.getVehicles.mockResolvedValue([]);
      const result = await resolver.getVehicles('NonExistentMake');
      expect(result).toEqual([]);
      expect(mockService.getVehicles).toHaveBeenCalledWith(
        'NonExistentMake',
        10,
        0,
      );
    });

    test('should throw an error if the service fails', async () => {
      mockService.getVehicles.mockRejectedValueOnce(new Error('Service error'));

      await expect(resolver.getVehicles('Toyota')).rejects.toThrow(
        'Service error',
      );
      expect(mockService.getVehicles).toHaveBeenCalledWith('Toyota', 10, 0);
    });

    test('should use default limit and offset if none provided', async () => {
      const result = await resolver.getVehicles('Toyota', undefined, undefined);
      expect(result).toEqual(vehicles);
      expect(mockService.getVehicles).toHaveBeenCalledWith('Toyota', 10, 0);
    });

    test('should handle invalid arguments', async () => {
      const result = await resolver.getVehicles(undefined, -5, -2);
      expect(result).toEqual(vehicles);
      expect(mockService.getVehicles).toHaveBeenCalledWith(undefined, 10, 0); // should default to valid values
    });
  });
});
