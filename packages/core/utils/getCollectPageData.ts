import { AdViewConfig } from '../typings';
import getRandomString from './getRandomString';

/**
 * Collects screen size information from the browser.
 * Used for ad targeting and responsive ad serving.
 * 
 * @returns Object with width and height as strings, or null on error
 */
function getScreenSize() {
  try {
    const d = document;
    const e = d.documentElement;
    const g = d.getElementsByTagName('body')[0];
    const w = String(window.innerWidth || e.clientWidth || g?.clientWidth);
    const h = String(window.innerHeight || e.clientHeight || g?.clientHeight);

    return {
      w,
      h,
    };
  } catch (error) {
    // Silently fail on server-side or when DOM is not available
  }

  return null;
}

// Type for data scraper functions
type Scraper = () => Record<string, string> | null;

// Array of scraper functions for collecting page data
type PageScraper = Scraper[];

/**
 * Registry of page data scrapers.
 * Can be extended by adding new scraper functions.
 */
export const pageScrapers: PageScraper = [getScreenSize];

/**
 * Executes all scrapers and merges their collected data.
 * 
 * @param scrapers - Array of scraper functions to execute
 * @returns Merged object containing all scraped data
 */
export function getScrapedData(scrapers: Scraper[]) {
  return scrapers.reduce((acc, scraper) => {
    const data = scraper();
    if (data) {
      return {
        ...acc,
        ...data,
      };
    }

    return acc;
  }, {});
}

/**
 * Converts an object of parameters into a URL search string.
 * 
 * @param params - Key-value pairs to convert to search params
 * @returns URL-encoded search parameter string
 */
export function getSearchParams(params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams(params);

  return searchParams.toString();
}

/**
 * Generates default search parameters for ad requests.
 * Includes cache-busting and timestamp parameters.
 * 
 * @param format - Optional ad format type to include
 * @returns Object with default parameters
 */
function getDefaultSearchParams(format?: string) {
  const requestTime = Date.now().toString(); // Use timestamp instead of day of month
  const randomString = getRandomString(7);
  const defaultParams: Record<string, string> = { // Fixed type consistency
    format: 'json',
    _cbf_: randomString, // Cache-busting parameter
    t: requestTime,      // Timestamp parameter
  };

  if (format) {
    defaultParams['type'] = format;
  }

  return defaultParams;
}

/**
 * Builds a complete ad request URL with collected page data and parameters.
 * Replaces template placeholders and adds query parameters.
 * 
 * @param config - AdView configuration containing srcURL template
 * @param unitId - Unique identifier for the ad unit
 * @param format - Optional ad format specification
 * @returns Complete URL ready for ad server request
 */
export function getAdRequestUrl(
  config: AdViewConfig,
  unitId: string,
  format?: string | string[],
) {
  const { srcURL } = config;
  
  // Replace {<id>} placeholder with actual unit ID
  const baseUrl = srcURL?.replace('{<id>}', unitId);
  
  // Collect page data using registered scrapers
  const scrapedData = getScrapedData(pageScrapers);
  
  // Generate default parameters
  const defaultSearchParams = getDefaultSearchParams(
    typeof format === 'string' ? format : format?.join(',') || '');

  // Merge all parameters (scraped data overrides defaults)
  const searchParamsData = {
    ...defaultSearchParams,
    ...scrapedData,
  };
  
  // Convert to URL search string
  const searchParams = getSearchParams(searchParamsData);
  
  // Build final URL
  const adRequestUrl = `${baseUrl}?${searchParams}`;

  return adRequestUrl;
}
