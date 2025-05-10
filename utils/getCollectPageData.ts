import getRandomString from './getRandomString';
import { AdViewConfig } from '@adview/react/src/types';

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
  } catch (error) {}

  return null;
}

type Scraper = () => Record<string, string> | null;

type PageScraper = Scraper[];

export const pageScrapers: PageScraper = [getScreenSize];

export function getScarperedData(scrapers: Scraper[]) {
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

export function getSearchParams(params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams(params);

  return searchParams.toString();
}

function getDefaultSearchParams(format?: string) {
  const requestTime = new Date().getUTCDate().toString();
  const randomString = getRandomString(7);
  const defaultParams: Record<string, unknown> = {
    format: 'json',
    _cbf_: randomString,
    t: requestTime,
  };

  if (format) {
    defaultParams['type'] = format;
  }

  return defaultParams;
}

export function getAdRequestUrl(
  config: AdViewConfig,
  unitId: string,
  format?: string,
) {
  const { srcURL } = config;
  const baseUrl = srcURL?.replace('{<id>}', unitId);
  const scarperedData = getScarperedData(pageScrapers);
  const defaultSearchParams = getDefaultSearchParams(format);
  const searchParamsData = {
    ...defaultSearchParams,
    ...scarperedData,
  };
  const searchParams = getSearchParams(searchParamsData);
  const adRequestUrl = `${baseUrl}?${searchParams}`;

  return adRequestUrl;
}
