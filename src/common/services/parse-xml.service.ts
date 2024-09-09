import { Injectable } from '@nestjs/common';
import * as xml2js from 'xml2js';
import axios from 'axios';

@Injectable()
export class ParseXmlService {
  async fetchXmlData(url: string): Promise<any> {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch XML data: ${error.message}`);
    }
  }

  async parseXmlToJson(xml: string): Promise<any> {
    try {
      const res = await xml2js.parseStringPromise(xml);
      return res.Response.Results[0];
    } catch (error) {
      throw new Error(`Failed to parse XML: ${error.message}`);
    }
  }
}
