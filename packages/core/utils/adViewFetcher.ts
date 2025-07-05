import { AdViewData } from '../typings';

/**
 * Fetches advertisement data from the ad server API.
 * Handles HTTP errors and JSON parsing for ad responses.
 * 
 * @param url - The ad server endpoint URL to fetch from
 * @returns Promise resolving to ad data or rejecting with error
 * @throws Error when HTTP request fails or response is invalid
 */
async function adViewFetcher(url: string): Promise<AdViewData | Error> {
  try {
    // Fetch ad data from the server
    const response = await fetch(url);

    // Check if the HTTP response was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse JSON response
    const responseJson = await response.json();

    return responseJson;
  } catch (error) {
    // Re-throw to allow caller to handle the error
    throw error;
  }
}

export default adViewFetcher;
