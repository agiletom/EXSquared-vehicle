import { ParseXmlService } from './parse-xml.service';
import * as xml2js from 'xml2js';
import axios from 'axios';

// Mocking axios and xml2js
jest.mock('axios');
jest.mock('xml2js', () => ({
  parseStringPromise: jest.fn(),
}));

describe('ParseXmlService', () => {
  let service: ParseXmlService;

  beforeEach(() => {
    service = new ParseXmlService();
  });

  describe('fetchXmlData', () => {
    test('should fetch XML data from the provided URL', async () => {
      const mockUrl = 'https://example.com/xml';
      const mockXmlData = '<xml>data</xml>';

      // Mock axios to resolve with mock data
      (axios.get as jest.Mock).mockResolvedValue({ data: mockXmlData });

      const result = await service.fetchXmlData(mockUrl);
      expect(result).toBe(mockXmlData); // Expect fetched data to match
      expect(axios.get).toHaveBeenCalledWith(mockUrl); // Ensure axios was called with the correct URL
    });

    test('should throw an error if fetching XML fails', async () => {
      const mockUrl = 'https://example.com/xml';

      // Mock axios to reject with an error
      (axios.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

      await expect(service.fetchXmlData(mockUrl)).rejects.toThrow(
        'Failed to fetch XML data: Network Error',
      );
    });
  });

  describe('parseXmlToJson', () => {
    test('should parse XML to JSON', async () => {
      const mockXml = '<xml></xml>';
      const mockJson = {
        Response: {
          Results: [{ key: 'value' }],
        },
      };

      // Mock xml2js to resolve with mock JSON data
      (xml2js.parseStringPromise as jest.Mock).mockResolvedValue(mockJson);

      const result = await service.parseXmlToJson(mockXml);
      expect(result).toEqual(mockJson.Response.Results[0]); // Expect parsed JSON to match
      expect(xml2js.parseStringPromise).toHaveBeenCalledWith(mockXml); // Ensure xml2js was called with the correct XML string
    });

    test('should throw an error if parsing XML fails', async () => {
      const mockXml = '<invalid>';

      // Mock xml2js to reject with an error
      (xml2js.parseStringPromise as jest.Mock).mockRejectedValue(
        new Error('Invalid XML'),
      );

      await expect(service.parseXmlToJson(mockXml)).rejects.toThrow(
        'Failed to parse XML: Invalid XML',
      );
    });
  });
});
