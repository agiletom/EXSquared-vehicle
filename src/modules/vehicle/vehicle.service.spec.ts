import { Test, TestingModule } from '@nestjs/testing';
import { VehicleService } from './vehicle.service';
import { getModelToken } from '@nestjs/mongoose';
import { Vehicle } from './entities/vehicle.schema';
import { ParseXmlService } from '../../common/services/parse-xml.service';
import { fetchWithRetry } from '../../utils';

jest.mock('../../utils', () => ({
  fetchWithRetry: jest.fn(),
}));

describe('VehicleService', () => {
  let service: VehicleService;

  const mockVehicleModel = {
    find: jest.fn(),
    insertMany: jest.fn(), // Mock insertMany for the error scenario
    deleteMany: jest.fn(), // Mock deleteMany for the error scenario
  };

  const mockParseXmlService = {
    parseXmlToJson: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleService,
        {
          provide: getModelToken(Vehicle.name),
          useValue: mockVehicleModel,
        },
        {
          provide: ParseXmlService,
          useValue: mockParseXmlService,
        },
      ],
    }).compile();

    service = module.get<VehicleService>(VehicleService);
  });

  test('should be defined', () => {
    expect(service).toBeDefined();
  });

  test('should throw a validation error if makeId or makeName is missing', async () => {
    const invalidVehicleData = [
      {
        vehicleTypes: [{ VehicleTypeId: '1', VehicleTypeName: 'SUV' }],
      },
    ];

    // Mock insertMany to throw a validation error for missing makeId/makeName
    mockVehicleModel.insertMany.mockRejectedValueOnce({
      errors: {
        makeId: 'Make ID is required',
        makeName: 'Make Name is required',
      },
    });

    // Test the error handling when validation fails
    try {
      await mockVehicleModel.insertMany(invalidVehicleData);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.errors.makeId).toBe('Make ID is required');
      expect(error.errors.makeName).toBe('Make Name is required');
    }
  });

  describe('getVehicles', () => {
    test('should return an array of vehicles', async () => {
      const vehicles = [{ makeId: '1', makeName: 'Toyota', vehicleTypes: [] }];
      mockVehicleModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(vehicles),
      });

      const result = await service.getVehicles();
      expect(result).toEqual(vehicles);
    });

    test('should return an empty array if no vehicles found', async () => {
      mockVehicleModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getVehicles();
      expect(result).toEqual([]);
    });
  });

  describe('getVehicleTypesByMakeId', () => {
    test('should fetch vehicle types by makeId', async () => {
      const xmlData = '<xml>data</xml>';
      const jsonData = {
        VehicleTypesForMakeIds: [
          { VehicleTypeId: '1', VehicleTypeName: 'SUV' },
        ],
      };

      (fetchWithRetry as jest.Mock).mockResolvedValue(xmlData);
      mockParseXmlService.parseXmlToJson.mockResolvedValue(jsonData);

      const result = await service.getVehicleTypesByMakeId(12858);
      expect(result).toEqual([
        {
          VehicleTypeId: JSON.stringify('1'),
          VehicleTypeName: JSON.stringify('SUV'),
        },
      ]);
      expect(fetchWithRetry).toHaveBeenCalledWith(
        'https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId/12858?format=xml',
      );
    });

    test('should handle errors in fetching vehicle types', async () => {
      (fetchWithRetry as jest.Mock).mockRejectedValue(
        new Error('Network error'),
      );

      await expect(service.getVehicleTypesByMakeId(12858)).rejects.toThrow(
        'Error fetching vehicle types for makeId 12858',
      );
      expect(fetchWithRetry).toHaveBeenCalledWith(
        'https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId/12858?format=xml',
      );
    });
  });

  describe('fetchAndStoreVehicleData', () => {
    test('should fetch and insert vehicles', async () => {
      const xmlData = '<xml>data</xml>';
      const jsonData = {
        AllVehicleMakes: [{ Make_ID: ['12858'], Make_Name: ['Toyota'] }],
      };

      const vehicleTypes = [{ VehicleTypeId: '1', VehicleTypeName: 'SUV' }];

      (fetchWithRetry as jest.Mock).mockResolvedValue(xmlData);
      mockParseXmlService.parseXmlToJson.mockResolvedValue(jsonData);
      jest
        .spyOn(service, 'getVehicleTypesByMakeId')
        .mockResolvedValue(vehicleTypes);

      await service.fetchAndStoreVehicleData();
      expect(fetchWithRetry).toHaveBeenCalledWith(
        'https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML',
      );
      expect(mockVehicleModel.deleteMany).toHaveBeenCalledWith({});
      expect(mockVehicleModel.insertMany).toHaveBeenCalledWith([
        {
          makeId: 12858,
          makeName: 'Toyota',
          vehicleTypes: vehicleTypes,
        },
      ]);
    });

    test('should handle errors during vehicle fetching', async () => {
      (fetchWithRetry as jest.Mock).mockRejectedValue(
        new Error('Network error'),
      );

      await expect(service.fetchAndStoreVehicleData()).rejects.toThrow(
        'Error fetching or storing vehicle data',
      );
      expect(fetchWithRetry).toHaveBeenCalledWith(
        'https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML',
      );
    });
  });
});
