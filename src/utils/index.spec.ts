import { Logger } from '@nestjs/common';
import axios from 'axios';
import { fetchWithRetry } from './index'; // Assuming the utility is in index.ts

jest.mock('axios');
jest.spyOn(Logger, 'error').mockImplementation(() => {});

describe('fetchWithRetry', () => {
  const mockUrl = 'https://example.com/xml';

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test to ensure no interference between tests
  });

  test('should return data on the first attempt', async () => {
    const responseData = '<xml>data</xml>';

    // Mock axios to resolve the first request
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: responseData });

    const result = await fetchWithRetry(mockUrl, 3);
    expect(result).toBe(responseData); // Expect the returned data to be the mock response
    expect(axios.get).toHaveBeenCalledTimes(1); // axios should have been called only once
  });

  test('should retry and return data after a failed attempt', async () => {
    const responseData = '<xml>data</xml>';

    // Mock axios to fail the first request and succeed the second one
    (axios.get as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ data: responseData });

    const result = await fetchWithRetry(mockUrl, 3);
    expect(result).toBe(responseData); // Expect the returned data to be the mock response
    expect(axios.get).toHaveBeenCalledTimes(2); // axios should have been called twice
    expect(Logger.error).toHaveBeenCalledWith(
      'Attempt 1 to fetch failed: Network error',
    );
  });

  test('should throw an error after exhausting retries', async () => {
    // Mock axios to fail every time
    (axios.get as jest.Mock).mockRejectedValue(new Error('Network error'));

    await expect(fetchWithRetry(mockUrl, 3)).rejects.toThrow(
      'Failed to fetch after 3 attempts',
    );

    expect(axios.get).toHaveBeenCalledTimes(3); // axios should have been called 3 times
    expect(Logger.error).toHaveBeenCalledWith(
      'Attempt 1 to fetch failed: Network error',
    );
    expect(Logger.error).toHaveBeenCalledWith(
      'Attempt 2 to fetch failed: Network error',
    );
    expect(Logger.error).toHaveBeenCalledWith(
      'Attempt 3 to fetch failed: Network error',
    );
  });

  test('should use default retry value of 3 when retries not provided', async () => {
    const responseData = '<xml>data</xml>';

    // Mock axios to fail twice and succeed on the third attempt
    (axios.get as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ data: responseData });

    const result = await fetchWithRetry(mockUrl); // No retries parameter provided
    expect(result).toBe(responseData); // Expect the returned data to be the mock response
    expect(axios.get).toHaveBeenCalledTimes(3); // axios should have been called 3 times
    expect(Logger.error).toHaveBeenCalledWith(
      'Attempt 1 to fetch failed: Network error',
    );
    expect(Logger.error).toHaveBeenCalledWith(
      'Attempt 2 to fetch failed: Network error',
    );
  });

  test('should fallback to default retries if process.env.FETCH_WITH_RETRY_TIMES is not a valid number', async () => {
    const responseData = '<xml>data</xml>';

    // Set the environment variable to an invalid number
    process.env.FETCH_WITH_RETRY_TIMES = 'invalid';

    // Mock axios to resolve after the first attempt
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: responseData });

    const result = await fetchWithRetry(mockUrl);
    expect(result).toBe(responseData); // Expect the returned data to be the mock response
    expect(axios.get).toHaveBeenCalledTimes(1); // axios should have been called only once
    delete process.env.FETCH_WITH_RETRY_TIMES; // Clean up the environment variable
  });
});
