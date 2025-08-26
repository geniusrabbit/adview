import { PopUnderData, PopUnderSettings } from './types';

let dataPopUnder: PopUnderData | undefined = window.dataPopUnder;
let detectAdBlock: boolean = false;

function PopUnder(config?: PopUnderData): void {
  if (config) {
    window.dataPopUnder = Object.assign({}, window?.dataPopUnder ?? {}, config);
  }

  // @ts-ignore
  this.init();
}

PopUnder.prototype = {
  cookieExpires: 6,
  filterParams: ['param1', 'param2', 'param3'] as string[],
  setting: {
    'cookie-name': 'ad_popunder',
    'every-direct': 1,
    params: ['domain=' + (location.host || ''), 'rnd=' + Math.random()],
  } as PopUnderSettings,
  mainWindow: (top != self &&
  typeof (top as Window).document.location.toString() == 'string'
    ? top
    : self) as Window,
  url: '',
  clickEvent: null as Event | null,
  popUnderRunning: false,

  init: function (this: any): void {
    const currentScript: HTMLScriptElement | null =
      document.currentScript as HTMLScriptElement;
    const banner: PopUnderData | HTMLScriptElement | undefined =
      dataPopUnder || currentScript;

    if (banner) {
      if (!dataPopUnder) {
        this.setBannerSettings(banner as HTMLScriptElement);
      } else {
        this.copySetting();
      }
      this.formatSetBannerSettings();
      this.addEvent('click', document, this.showPopUnder.bind(this));
    }
  },
  showPopUnder: function (this: any, event: Event): void {
    this.clickEvent = event || window.event!;
    const element: HTMLElement = (this.clickEvent.target ||
      (this.clickEvent as any).srcElement) as HTMLElement;
    const href: string | undefined =
      (element as HTMLAnchorElement).href &&
      this.getStringFormat((element as HTMLAnchorElement).href.split('/'));

    if (this.doNotShow(element) || this.popUnderRunning) {
      return;
    }

    this.setUrl(href);
    this.openTab();
  },

  openTab: function (this: any): void {
    const event: Event = this.clickEvent!;
    const COUNT_PARENT: number = 4;
    let depth: number = 0;
    let target: HTMLElement = event.target as HTMLElement;

    event.preventDefault();

    if (target.nodeName.toLowerCase() !== 'a') {
      while (
        target.parentNode &&
        depth++ <= COUNT_PARENT &&
        target.nodeName.toLowerCase() !== 'html'
      ) {
        target = target.parentNode as HTMLElement;
        if (
          target.nodeName.toLowerCase() === 'a' &&
          (target as HTMLAnchorElement).href !== ''
        ) {
          break;
        }
      }
    }

    this.desktopTab(target);

    this.mainWindow.location.href = this.url;
  },
  desktopTab: function (this: any, target: HTMLElement): void {
    const newTab: Window | null = window.open(
      (target as HTMLAnchorElement).href || this.mainWindow.location.href,
      '_blank',
    );
    const cookieName: string = this.setting['cookie-name'];

    if (newTab) {
      newTab.focus();
      this.setCookie(cookieName, 1, this.cookieExpires);
    } else {
      this.url =
        (target as HTMLAnchorElement).href || this.mainWindow.location.href;
    }
  },

  copySetting: function (this: any): void {
    let value: any;

    for (const prop in dataPopUnder!) {
      value = dataPopUnder![prop];
      if (this.filterParams.indexOf(prop) !== -1) {
        this.setting.params.push(prop + '=' + value);
        continue;
      }
      (this.setting as any)[prop] = value;
    }
  },
  doNotShow: function (this: any, element: HTMLElement): boolean {
    const ID_FIRST_MOUSE_BUTTON: number = 1;
    const which: number = this.clickEvent && (this.clickEvent as any).which;
    const isATag: boolean = this.isSelectiveTarget(element);
    const cookieName: string = this.setting['cookie-name'];
    const shouldSkipByClickCount: boolean = !this.checkEveryDirectCount();
    const showPopUnder: boolean =
      this.getCookie(cookieName) !== null ||
      this.checkIgnoreFilter(element) ||
      ('selective' === this.setting.mode && !isATag) ||
      (detectAdBlock && !isATag) ||
      !!element.getAttribute('target') ||
      shouldSkipByClickCount;

    if (which && which !== ID_FIRST_MOUSE_BUTTON) {
      return true;
    }

    return showPopUnder;
  },
  checkEveryDirectCount: function (this: any): boolean {
    const settingEveryDirect = Number(this.setting['every-direct']);
    const everyDirectCount: number = isNaN(settingEveryDirect)
      ? 1
      : settingEveryDirect;
    const storageKey = 'ad_popunder_click_count';
    const currentCount = parseInt(this.getLocalStorage(storageKey) || '0', 10);
    const newCount = currentCount + 1;

    this.setLocalStorage(storageKey, newCount.toString());

    return newCount % everyDirectCount === 0;
  },
  checkIgnoreFilter: function (this: any, element: HTMLElement): boolean {
    const targetSelectors: string[] | undefined = this.setting.target;

    if (targetSelectors) {
      const selectors: string[] = targetSelectors.map(selector =>
        selector.trim(),
      );

      for (const selector of selectors) {
        if (selector && element.matches(selector)) {
          return false;
        }
      }
    }

    return true;
  },
  setBannerSettings: function (this: any, elm: HTMLElement): void {
    const attributes: NamedNodeMap = elm.attributes;
    let settingsName: string, value: string;

    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i] as Attr;
      settingsName = attr?.name;

      if (
        settingsName &&
        (settingsName.indexOf('data-ad') !== -1 ||
          settingsName.indexOf('data-id') !== -1)
      ) {
        settingsName = settingsName.replace('data-ad-', '');

        if (settingsName === 'data-id') {
          settingsName = 'unitid';
        }

        value = attr.value;

        if (this.filterParams.indexOf(settingsName) !== -1) {
          this.setting.params.push(settingsName + '=' + value);
          continue;
        }
        (this.setting as any)[settingsName] = value;
      }
    }
  },
  formatSetBannerSettings: function (this: any): void {
    this.setting.categories = [
      this.setting.categories || '',
      this.getMetaWords(),
    ].join(',');

    if (this.setting['ignore-filter']) {
      this.setting['ignore-filter'] = (this.setting['ignore-filter'] as string)
        .replace(/\s+/g, '')
        .split(',');
    }
    if (this.setting['target']) {
      this.setting['target'] = this.setting['target']
        .replace(/\s+/g, '')
        .split(',');
    }
    if (this.setting.template) {
      this.setting.template = this.formatRedirectURL(this.setting.template);
    }
    if (this.setting.every) {
      this.cookieExpires = this.parseEveryValue(this.setting.every);
    }
  },
  parseEveryValue: function (everyValue: string): number {
    const defaultHours = 6;

    if (!everyValue) {
      return defaultHours;
    }

    const cleanValue = everyValue.toLowerCase().replace(/\s+/g, '');
    const hoursMatch = cleanValue.match(/(\d+)h/)?.[1];
    const minutesMatch = cleanValue.match(/(\d+)m/)?.[1];

    const hours = hoursMatch ? parseInt(hoursMatch, 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch, 10) : 0;
    const totalHours = hours + minutes / 60;

    return totalHours || defaultHours;
  },
  formatRedirectURL: function (this: any, redirectUrl: string): string {
    if (!/^(f|ht)tps?:\/\//i.test(redirectUrl)) {
      redirectUrl = 'http://' + redirectUrl;
    } else if (redirectUrl.slice(-1) !== '/') {
      redirectUrl += '/';
    }

    return redirectUrl;
  },
  setUrl: function (this: any, href?: string): void {
    const url: string =
      this.getRedirectUrl() +
      '?' +
      this.setting.params.join('&') +
      this.getPositionCursor() +
      this.getScreenSize() +
      this.timeZone() +
      '&adb=' +
      +detectAdBlock +
      '&categories=' +
      this.getCategories(href);

    this.url = url;
  },
  getScreenSize: function (this: any): string {
    let screenSize: string = '';
    const devicePixelRatio: number = window.devicePixelRatio || 1;
    const screen: Screen = window.screen || ({} as Screen);
    const width: number = (screen as any).width;
    const height: number = (screen as any).height;

    if (width && height) {
      screenSize =
        '&w=' +
        parseInt((width * devicePixelRatio).toString(), 10) +
        '&h=' +
        parseInt((height * devicePixelRatio).toString(), 10);
    }

    return screenSize;
  },
  timeZone: function (this: any): string {
    const tz: number = new Date().getTimezoneOffset();
    const param: string = '&tz=' + tz;
    return param.replace('-', '%2D');
  },
  getCategories: function (this: any, href?: string): string {
    let categories: string = this.setting.categories || '';

    if (!categories && href) {
      categories = href;
    } else if (!categories) {
      categories = this.getLocalStorage('ad_categories') || '';
    }

    if (categories) {
      this.setLocalStorage('ad_categories', categories);
      this.setting.categories = categories;

      return categories;
    }

    return '';
  },
  getRedirectUrl: function (this: any): string {
    const redirectUrlHasSpot: boolean = !!(
      this.setting.template && this.setting.template.indexOf('{unitid}') >= 0
    );
    const redirectReplaceUrl: string | false =
      redirectUrlHasSpot &&
      this.setting.template!.replace('{unitid}', this.setting.unitid || '');

    if (redirectReplaceUrl) {
      return redirectReplaceUrl;
    }

    return (
      (this.setting.template || this.getDomain()) +
      '/' +
      (this.setting.unitid || '')
    );
  },
  isSelectiveTarget: function (this: any, elm: HTMLElement): boolean {
    let tag: string = elm.tagName.toLowerCase();

    while (tag && 'body' !== tag) {
      if ('a' === tag) return true;

      elm = elm.parentNode as HTMLElement;
      tag = elm && elm.tagName && elm.tagName.toLowerCase();
    }

    return false;
  },
  getMetaWords: function (this: any): string {
    const meta: HTMLCollectionOf<HTMLMetaElement> =
      document.getElementsByTagName('meta');
    const metaCount: number = meta.length;
    let getWords: string = '';
    let i: number = 0;

    while (i < metaCount) {
      const item: HTMLMetaElement | undefined = meta[i];

      if (
        item?.getAttribute('name') === 'description' ||
        item?.getAttribute('name') === 'keywords'
      ) {
        getWords += ' ' + (item?.getAttribute('content') || '');
      }
      i++;
    }

    if (document.title) {
      getWords += ' ' + document.title;
    }
    if (!getWords.length) {
      getWords = this.getStringFormat(window.location.pathname.split('/'));
    }

    return getWords
      .replace(/[^\w\s]/gi, ' ')
      .replace(/(^\s+)|(\b(\w{1,2})\b(\s|$))/g, '')
      .replace(/\s+/gi, ',');
  },
  getStringFormat: function (this: any, arr: string[]): string {
    const lastItem: string | undefined =
      arr && arr?.[arr.length - 1]?.split(/[?#]/)[0];
    const formatText: string[] | boolean | null =
      !!lastItem && lastItem.replace(/(x?html?)$/gi, '').match(/([a-zA-Z]+)/g);

    const formatTextString: string | false | null =
      formatText && formatText.join(' ').replace(/(\b(\w{1,2})\b(\s|$))/g, '');

    return formatTextString || '';
  },
  addEvent: function (
    this: any,
    event: string,
    elem: HTMLElement | Document,
    func: EventListener,
  ): void | boolean {
    if (elem.addEventListener) {
      elem.addEventListener(event, func, false);
    } else if ((elem as any).attachEvent) {
      const r: boolean = (elem as any).attachEvent('on' + event, func);
      return r;
    }
  },
  getDomain: function (this: any): string {
    const defaultUrl = process.env.POPUNDER_DEFAULT_URL ?? '';

    if (!defaultUrl) {
      throw Error('POPUNDER_DEFAULT_URL is not defined');
    }

    return defaultUrl;
  },
  getPositionCursor: function (this: any): string {
    const documentElement: HTMLElement = document.documentElement;
    const event: Event = this.clickEvent!;
    const x: number =
      (event as any).pageX ||
      (event as any).clientX +
        (documentElement.scrollLeft
          ? documentElement.scrollLeft
          : document.body.scrollLeft);
    const y: number =
      (event as any).pageY ||
      (event as any).clientY +
        (documentElement.scrollTop
          ? documentElement.scrollTop
          : document.body.scrollTop);

    return '&x=' + x + '&y=' + y;
  },

  parentFilter: function (this: any, e: HTMLElement): boolean | undefined {
    const parentElm: HTMLElement | null = e.parentNode as HTMLElement;
    const isHtml: boolean =
      e.nodeName === 'HTML' || (parentElm && parentElm.nodeName === 'HTML');

    if (parentElm && !isHtml) {
      if (this.ignoreFilter(parentElm, true)) {
        return true;
      }
      return this.parentFilter(parentElm);
    }
    return undefined;
  },
  ignoreFilter: function (
    this: any,
    elm: HTMLElement,
    parentFilter?: boolean,
  ): boolean {
    const selectorsList: string[] = (elm.className || '').split(' ');
    let i: number = 0;
    let count: number;

    if (elm.id) {
      selectorsList.push(elm.id);
    }

    if (this.setting['ignore-filter']) {
      count = selectorsList.length;

      for (; i < count; i++) {
        if (this.checkIgnore(selectorsList[i])) {
          return true;
        }
      }
      if (parentFilter) {
        return false;
      }
      if (this.parentFilter(elm)) {
        return true;
      }
    }

    if (typeof window.pop_ts_click_filter === 'function') {
      return window.pop_ts_click_filter(elm);
    }

    return false;
  },
  checkIgnore: function (this: any, elClass: string): boolean {
    const ignoreList: string[] = this.setting['ignore-filter'] as string[];
    const count: number = ignoreList?.length || 0;
    let i: number = 0;

    for (; i < count; i++) {
      if (ignoreList[i] === elClass) {
        return true;
      }
    }
    return false;
  },

  setLocalStorage: function (this: any, name: string, value: string): void {
    try {
      if (window.localStorage) {
        window.localStorage.setItem(name, value);
      }
    } catch (e) {}
  },

  getLocalStorage: function (this: any, name: string): string | null {
    try {
      if (window.localStorage) {
        return window.localStorage.getItem(name);
      }
    } catch (e) {}
    return null;
  },

  setCookie: function (
    this: any,
    cookieName: string,
    cookieState: number,
    cookieLifetime: number,
  ): void {
    const expires: string = new Date(
      new Date().getTime() + cookieLifetime * 3600000,
    ).toUTCString();
    const domain: string = this.setting['cookie-domain']
      ? '; domain=' + this.setting['cookie-domain']
      : '';

    document.cookie =
      cookieName +
      '=' +
      cookieState +
      '; expires=' +
      expires +
      domain +
      '; path=/';
  },
  getCookie: function (this: any, cookieName: string): string | null {
    const resultCookie: RegExpMatchArray | null = document.cookie.match(
      '(^|;) ?' + cookieName + '=([^;]*)(;|$)',
    );

    if (resultCookie && resultCookie[2]) {
      return decodeURIComponent(resultCookie[2]);
    }

    return null;
  },
};

export default PopUnder;
