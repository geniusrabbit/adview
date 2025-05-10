import { AdViewData } from '../typings';

async function adViewFetcher(url: string): Promise<AdViewData | Error> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseJson = await response.json();

    return responseJson;
  } catch (error) {
    throw error;
  }
}

export default adViewFetcher;
