import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehicle } from './entities/vehicle.schema';
import { ParseXmlService } from '../../common/services/parse-xml.service'; // Import ParseXmlService
import { fetchWithRetry } from '../../utils';

@Injectable()
export class VehicleService {
  constructor(
    @InjectModel(Vehicle.name) private vehicleModel: Model<Vehicle>,
    private readonly parseXmlService: ParseXmlService, // Inject ParseXmlService
  ) {}

  // Fetch vehicles with optional makeName filter and pagination
  async getVehicles(
    makeName?: string,
    limit = 10,
    offset = 0,
  ): Promise<Vehicle[]> {
    const filter = makeName ? { makeName: new RegExp(makeName, 'i') } : {}; // Filter vehicles based on makeName (if provided)

    return this.vehicleModel
      .find(filter)
      .skip(offset) // Pagination: Skip the number of documents based on offset
      .limit(limit) // Limit the number of documents to return
      .exec();
  }

  // Fetch vehicle types by MakeId from the external API, handling potential errors
  async getVehicleTypesByMakeId(makeId: number): Promise<any[]> {
    const xmlUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId/${makeId}?format=xml`; // API endpoint for fetching vehicle types by makeId

    try {
      // Step 1: Fetch XML data for the given makeId
      const xmlData = await fetchWithRetry(xmlUrl);

      // Step 2: Parse XML to JSON format
      const jsonData = await this.parseXmlService.parseXmlToJson(xmlData);

      // Step 3: Map vehicle types to structured objects for the database
      const vehicleTypes = jsonData.VehicleTypesForMakeIds?.map((type) => ({
        VehicleTypeId: JSON.stringify(type.VehicleTypeId),
        VehicleTypeName: JSON.stringify(type.VehicleTypeName),
      }));

      return vehicleTypes;
    } catch (error) {
      Logger.error(
        `Failed to fetch vehicle types for makeId ${makeId}: ${error.message}`,
      );
      throw new Error(`Error fetching vehicle types for makeId ${makeId}`);
    }
  }

  // Fetch, parse, and store vehicle data with bulk insert and comprehensive error handling
  async fetchAndStoreVehicleData(): Promise<void> {
    const xmlUrl =
      'https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML'; // API endpoint for fetching all vehicle makes

    try {
      // Step 1: Fetch the XML data for all vehicle makes
      const xmlData = await fetchWithRetry(xmlUrl); // Retry fetching if necessary

      // Step 2: Parse the fetched XML data to JSON format
      const jsonData = await this.parseXmlService.parseXmlToJson(xmlData);

      // Step 3: Prepare an array to store vehicle documents for bulk insertion
      const vehiclesToInsert = [];

      // Step 4: Iterate through the parsed vehicle makes and prepare them for insertion
      for (const make of jsonData.AllVehicleMakes) {
        const makeId = parseInt(make.Make_ID[0], 10); // Convert Make_ID to a number
        const vehicleTypes = await this.getVehicleTypesByMakeId(makeId); // Fetch associated vehicle types

        // Add the prepared vehicle document to the array
        vehiclesToInsert.push({
          makeId: makeId, // Store makeId as a number
          makeName: make.Make_Name[0], // Store makeName as a string
          vehicleTypes: vehicleTypes, // Store associated vehicle types
        });

        Logger.log(
          `${vehiclesToInsert.length} Vehicle data has been successfully prepared for insertion.`,
        );
      }

      // Step 5: Insert data in batches of 100
      const batchSize = 100;
      for (let i = 0; i < vehiclesToInsert.length; i += batchSize) {
        const batch = vehiclesToInsert.slice(i, i + batchSize);
        await this.vehicleModel.insertMany(batch);
        Logger.log(
          `${batch.length} vehicles have been successfully inserted in this batch.`,
        );
      }

      if (vehiclesToInsert.length === 0) {
        Logger.log('No vehicles to insert.');
      }
    } catch (error) {
      Logger.error('Error fetching or storing vehicle data', error.message);
      throw new Error('Error fetching or storing vehicle data');
    }
  }
}
