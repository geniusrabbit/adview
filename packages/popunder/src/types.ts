export interface PopUnderData {
  [key: string]: any;
  'cookie-name'?: string;
  'cookie-domain'?: string;
  every?: string;
  'every-direct'?: number;
  'ignore-filter'?: string;
  target?: string;
  categories?: string;
  template?: string;
  unitid?: string;
  mode?: string;
}

export interface CheckAdBlockOptions {
  checkOnLoad: boolean;
  loopCheckTime: number;
  loopMaxNumber: number;
  baitClass: string;
  baitStyle: string;
}

export interface CheckAdBlockVar {
  bait: HTMLElement | null;
  checking: boolean;
  loop: NodeJS.Timeout | null;
  loopNumber: number;
  ie6: RegExpMatchArray | null;
  ie7: RegExpMatchArray | null;
}

export interface PopUnderSettings {
  'cookie-name': string;
  'cookie-domain'?: string;
  every?: string;
  'every-direct'?: number;
  'ignore-filter'?: string[];
  target?: string;
  categories?: string;
  template?: string;
  unitid?: string;
  mode?: string;
  params: string[];
}

declare global {
  interface Window {
    TEMPORARY?: number;
    attachEvent?: (type: string, listener: EventListener) => boolean;
    chrome?: any;
    dataPopUnder?: PopUnderData;
    readonly devicePixelRatio: number;
    readonly event: Event | undefined;
    indexedDB?: IDBFactory;
    localStorage: Storage;
    readonly navigator: Navigator;
    pop_ts_click_filter?: (element: HTMLElement) => boolean;
    safari?: any;
    readonly screen: Screen;
    webkitRequestFileSystem?: any;
  }
}
