interface PopUnderData {
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

interface CheckAdBlockOptions {
  checkOnLoad: boolean;
  loopCheckTime: number;
  loopMaxNumber: number;
  baitClass: string;
  baitStyle: string;
}

interface CheckAdBlockVar {
  bait: HTMLElement | null;
  checking: boolean;
  loop: NodeJS.Timeout | null;
  loopNumber: number;
  ie6: RegExpMatchArray | null;
  ie7: RegExpMatchArray | null;
}

interface UserAgent {
  chromeOs: boolean;
  webkit: boolean;
  mozilla: boolean;
  chrome: boolean;
  maxthon: boolean;
  samsung: boolean;
  msie: boolean;
  firefox: boolean;
  safari: boolean;
  opera: boolean;
  macosx: boolean;
  windowsXP: boolean;
  windows: boolean;
  ios: boolean;
  crios: boolean;
  android: boolean;
  mobile: boolean;
  winphone: boolean;
  edge: boolean;
  yaBrowser: boolean;
  version: string;
}

interface PopUnderSettings {
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

(function (window: Window): void {
  'use strict';

  let detectAdBlock: boolean = false;
  let dataPopUnder: PopUnderData | undefined = window.dataPopUnder;

  const CheckAdBlock = function (this: any): void {
    const userAgent: string = window.navigator.userAgent;

    this._options = {
      checkOnLoad: true,
      loopCheckTime: 50,
      loopMaxNumber: 5,
      baitClass:
        'pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links',
      baitStyle:
        'width: 1px !important; height: 1px !important; position: absolute !important; left: -10000px !important; top: -1000px !important;',
    };
    this._var = {
      bait: null,
      checking: false,
      loop: null,
      loopNumber: 0,
      ie6: userAgent.match(/MSIE\s6\./g),
      ie7: userAgent.match(/MSIE\s7\./g),
    };

    const self = this;
    const eventCallback = function (): void {
      setTimeout(function (): void {
        if (self._options.checkOnLoad === true) {
          if (self._var.bait === null) {
            self._creatBait();
          }
          setTimeout(function (): void {
            self.check();
          }, 1);
        }
      }, 1);
    };
    if (window.addEventListener !== undefined) {
      window.addEventListener('load', eventCallback, false);
    } else {
      window.attachEvent!('onload', eventCallback);
    }
  };

  CheckAdBlock.prototype = {
    _options: null as CheckAdBlockOptions | null,
    _var: null as CheckAdBlockVar | null,
    _bait: null as HTMLElement | null,
    _creatBait: function (this: any): void {
      const bait: HTMLElement = document.createElement('div');
      bait.setAttribute('class', this._options.baitClass);
      bait.setAttribute('style', this._options.baitStyle);
      this._var.bait = window.document.body.appendChild(bait);

      this._var.bait.offsetParent;
      this._var.bait.offsetHeight;
      this._var.bait.offsetLeft;
      this._var.bait.offsetTop;
      this._var.bait.offsetWidth;
      this._var.bait.clientHeight;
      this._var.bait.clientWidth;
    },
    _destroyBait: function (this: any): void {
      if (this._var.bait) {
        window.document.body.removeChild(this._var.bait);
        this._var.bait = null;
      }
    },
    check: function (this: any, loop?: boolean): boolean {
      if (loop === undefined) {
        loop = true;
      }
      if (this._var.checking === true) {
        return false;
      }
      this._var.checking = true;

      if (this._var.bait === null) {
        this._creatBait();
      }

      const self = this;
      this._var.loopNumber = 0;
      if (loop === true) {
        this._var.loop = setInterval(function (): void {
          self._checkBait(loop);
        }, this._options.loopCheckTime);
      }
      setTimeout(function (): void {
        self._checkBait(loop);
      }, 1);

      return true;
    },
    _checkBait: function (this: any, loop?: boolean): void {
      let detected: boolean = false;

      if (this._var.bait === null) {
        this._creatBait();
      }

      if (
        window.document.body.getAttribute('abp') !== null ||
        this._var.bait.offsetParent === null ||
        this._var.bait.offsetHeight === 0 ||
        this._var.bait.offsetLeft === 0 ||
        this._var.bait.offsetTop === 0 ||
        this._var.bait.offsetWidth === 0 ||
        this._var.bait.clientHeight === 0 ||
        this._var.bait.clientWidth === 0
      ) {
        detected = true;
      }
      if (window.getComputedStyle !== undefined) {
        const baitTemp: CSSStyleDeclaration = window.getComputedStyle(
          this._var.bait,
          null,
        );
        if (
          baitTemp.getPropertyValue('display') == 'none' ||
          baitTemp.getPropertyValue('visibility') == 'hidden'
        ) {
          detected = true;
        }
      }

      if (loop === true) {
        this._var.loopNumber++;
        if (this._var.loopNumber >= this._options.loopMaxNumber) {
          this._stopLoop();
        }
      }

      if (this._var.ie6 || this._var.ie7) {
        detected = false;
      }

      if (detected === true) {
        this._stopLoop();
        detectAdBlock = true;
      } else if (this._var.loop === null || loop === false) {
        detectAdBlock = false;
      }
      this._destroyBait();

      if (loop === true) {
        this._var.checking = false;
      }
    },
    _stopLoop: function (this: any): void {
      if (this._var.loop) {
        clearInterval(this._var.loop);
        this._var.loop = null;
        this._var.loopNumber = 0;
      }
    },
  };

  new (CheckAdBlock as any)();

  function PopUnder(this: any): void {
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

      if (this.userAgent.winphone) {
        this.mobileTab(target);
      } else {
        this.desktopTab(target);
      }

      this.mainWindow.location.href = this.url;
    },
    mobileTab: function (this: any, target: HTMLElement): void {
      const hyperlink: HTMLAnchorElement = document.createElement('a');
      let event: MouseEvent;

      hyperlink.href =
        (target as HTMLAnchorElement).href || this.mainWindow.location.href;

      hyperlink.setAttribute('target', '_blank');

      try {
        event = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
        });
      } catch (e) {
        event = document.createEvent('MouseEvents') as MouseEvent;
        (event as any).initMouseEvent(
          'click',
          true,
          true,
          window,
          0,
          0,
          0,
          0,
          0,
          true,
          false,
          false,
          false,
          0,
          null,
        );
      }

      hyperlink.dispatchEvent(event);
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
      const userAgentVersion: number = parseInt(
        this.userAgent.version || '0',
        10,
      );
      const cookieName: string = this.setting['cookie-name'];
      const shouldSkipByClickCount: boolean = !this.checkEveryDirectCount();
      const showPopUnder: boolean =
        this.getCookie(cookieName) !== null ||
        this.checkIgnoreFilter(element) ||
        ('selective' === this.setting.mode && !isATag) ||
        (detectAdBlock && !isATag) ||
        !!element.getAttribute('target') ||
        shouldSkipByClickCount ||
        (this.userAgent.chrome &&
          !this.userAgent.edge &&
          !this.userAgent.opera &&
          userAgentVersion > 41 &&
          userAgentVersion < 49 &&
          !isATag);

      if (this.userAgent.chromeOs) {
        return true;
      }

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
      const currentCount = parseInt(
        this.getLocalStorage(storageKey) || '0',
        10,
      );
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
        this.setting['ignore-filter'] = (
          this.setting['ignore-filter'] as string
        )
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
        !!lastItem &&
        lastItem.replace(/(x?html?)$/gi, '').match(/([a-zA-Z]+)/g);

      const formatTextString: string | false | null =
        formatText &&
        formatText.join(' ').replace(/(\b(\w{1,2})\b(\s|$))/g, '');

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

    userAgent: (function (): UserAgent {
      const n: string = navigator.userAgent.toLowerCase();
      const b: UserAgent = {
        chromeOs: /CrOS/gi.test(n),
        webkit: /webkit/gi.test(n),
        mozilla: /mozilla/gi.test(n) && !/(compatible|webkit)/.test(n),
        chrome: /chrome/gi.test(n),
        maxthon: /maxthon/gi.test(n),
        samsung: /samsungbrowser/gi.test(n),
        msie: /msie/gi.test(n) && !/opera/.test(n),
        firefox: /firefox/gi.test(n),
        safari: /safari/gi.test(n) && !/chrome/.test(n),
        opera: /opera|opr/gi.test(n),
        macosx: /mac os x/gi.test(n),
        windowsXP: /Windows NT 5/gi.test(n),
        windows: /Windows NT/gi.test(n),
        ios: /iphone|ipad/gi.test(n),
        crios: /crios/gi.test(n),
        android: /android/gi.test(n),
        mobile: /mobile/gi.test(n) || /tablet/gi.test(n),
        winphone: /windows phone/gi.test(n),
        edge: /Edge/gi.test(n),
        yaBrowser: /YaBrowser/gi.test(n),
        version: '',
      };
      b.version = b.safari
        ? (n.match(/.+?(?:on|ri)[\/: ]([\d.]+)/) || [])[1] || ''
        : (n.match(/.+(?:ox|me|ra|ie|opr)[\/: ]([\d.]+)/) || [])[1] || '';
      return b;
    })(),
  };

  new (PopUnder as any)();
})(window);
