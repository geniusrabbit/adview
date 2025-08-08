import { AdViewData } from '../typings';

/**
 * Fetches advertisement data from the ad server API.
 * Handles HTTP errors and JSON parsing for ad responses.
 * 
 * @param url - The ad server endpoint URL to fetch from
 * @returns Promise resolving to ad data or rejecting with error
 * @throws Error when HTTP request fails or response is invalid
 */
async function adViewFetcher(url: string, defaultData?: AdViewData[]): Promise<AdViewData | Error> {
  try {
    // Fetch ad data from the server
    const response = await fetch(url);

    // Check if the HTTP response was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse JSON response
    const responseJson = await response.json();
    if ((!responseJson || typeof responseJson !== 'object' || !responseJson.groups?.length ||
      (responseJson.groups?.length === 1 && !responseJson.groups[0]?.items?.length)
    ) && !!defaultData && defaultData?.length > 0) {
      let adItem = defaultData[Math.floor(Math.random() * defaultData.length)];
      if (adItem?.groups && adItem?.groups.length > 0) {
        return adItem;
      }
    }

    return responseJson;
  } catch (error) {
    if (!!defaultData && defaultData?.length > 0) {
      let adItem = defaultData[Math.floor(Math.random() * defaultData.length)];
      if (adItem?.groups && adItem?.groups.length > 0) {
        return adItem;
      }
    }
    // Re-throw to allow caller to handle the error
    throw error;
  }
}

export default adViewFetcher;
