import { Logger } from '@nestjs/common';
import axios from 'axios';

// Retry mechanism for fetching data with a specified number of retries
export async function fetchWithRetry(
  url: string,
  retries: number = parseInt(process.env.FETCH_WITH_RETRY_TIMES) || 3,
): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      Logger.error(`Attempt ${attempt} to fetch failed: ${error.message}`);

      // If the last attempt also fails, throw an error
      if (attempt === retries) {
        throw new Error(`Failed to fetch after ${retries} attempts`);
      }
    }
  }
}
