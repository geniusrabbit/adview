(function (window) {
  'use strict';

  let detectAdBlock = false;
  let detectPrivacyMode = false;
  let dataPopUnder = window.dataPopUnder;

  /**
   * Check AdBlock
   */
  const CheckAdBlock = function () {
    const userAgent = window.navigator.userAgent;

    this._options = {
      checkOnLoad: true,
      loopCheckTime: 50,
      loopMaxNumber: 5,
      baitClass:
        'pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links',
      baitStyle:
        'width: 1px !important; height: 1px !important; position: absolute !important; left: -10000px !important; top: -1000px !important;',
    };
    this._const = {
      bait: null,
      checking: false,
      loop: null,
      loopNumber: 0,
      ie6: userAgent.match(/MSIE\s6\./g),
      ie7: userAgent.match(/MSIE\s7\./g),
    };

    const self = this;
    const eventCallback = function () {
      setTimeout(function () {
        if (self._options.checkOnLoad === true) {
          if (self._var.bait === null) {
            self._creatBait();
          }
          setTimeout(function () {
            self.check();
          }, 1);
        }
      }, 1);
    };
    if (window.addEventListener !== undefined) {
      window.addEventListener('load', eventCallback, false);
    } else {
      window.attachEvent('onload', eventCallback);
    }
  };

  CheckAdBlock.prototype = {
    _options: null,
    _var: null,
    _bait: null,
    _creatBait: function () {
      const bait = document.createElement('div');
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
    _destroyBait: function () {
      window.document.body.removeChild(this._var.bait);
      this._var.bait = null;
    },
    check: function (loop) {
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
        this._var.loop = setInterval(function () {
          self._checkBait(loop);
        }, this._options.loopCheckTime);
      }
      setTimeout(function () {
        self._checkBait(loop);
      }, 1);

      return true;
    },
    _checkBait: function (loop) {
      let detected = false;

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
        const baitTemp = window.getComputedStyle(this._var.bait, null);
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
    _stopLoop: function () {
      clearInterval(this._var.loop);
      this._var.loop = null;
      this._var.loopNumber = 0;
    },
  };

  new CheckAdBlock();

  /**
   * Privacy Mode Detector
   */
  function PrivacyModeDetector() {
    this.ua = window['navigator']['userAgent'].toLowerCase();
    this.browser = this._getBrowser();
    this.privacy = null;

    this._detectPrivacy();
    this['report']();
    return this;
  }

  PrivacyModeDetector.prototype = {
    _detectIE: function () {
      const msie = this.ua.indexOf('msie ');
      if (msie > 0) {
        return parseInt(
          this.ua.substring(msie + 5, this.ua.indexOf('.', msie)),
          10,
        );
      }

      const trident = this.ua.indexOf('trident/');
      if (trident > 0) {
        const rv = this.ua.indexOf('rv:');
        return parseInt(
          this.ua.substring(rv + 3, this.ua.indexOf('.', rv)),
          10,
        );
      }

      const edge = this.ua.indexOf('edge/');
      if (edge > 0) {
        return parseInt(
          this.ua.substring(edge + 5, this.ua.indexOf('.', edge)),
          10,
        );
      }

      return false;
    },

    _detectSafari: function () {
      try {
        return (
          !!window['safari'] ||
          (this.ua.indexOf('safari') != -1 &&
            this.ua.indexOf('chrome') === -1 &&
            this.ua.indexOf('crios') === -1)
        );
      } catch (e) {
        return false;
      }
    },

    _detectChrome: function () {
      try {
        return (
          !!window['chrome'] ||
          this.ua.indexOf('crios') !== -1 ||
          (window['navigator']['vendor'].indexOf('Google') === 0 &&
            this.ua.indexOf('chrome') !== -1)
        );
      } catch (e) {
        return false;
      }
    },

    _detectFF: function () {
      try {
        return this.ua.indexOf('firefox') != -1;
      } catch (e) {
        return false;
      }
    },

    _getBrowser: function () {
      const browsers = {
        isIE: this._detectIE(),
        isSafari: this._detectSafari(),
        isChrome: this._detectChrome(),
        isFF: this._detectFF(),
      };

      return browsers;
    },

    _detectIEPrivacy: function () {
      if (this.browser.isIE < 10) {
        this.privacy = false;

        return false;
      }

      try {
        if (!window['indexedDB']) {
          this.privacy = true;
        } else {
          this.privacy = false;
        }
      } catch (e) {
        this.privacy = false;
      }
    },

    _detectSafariPrivacy: function () {
      try {
        window['localStorage'].setItem('check', 1);
        window['localStorage'].getItem('check');
        window['localStorage'].removeItem('check');
        this.privacy = false;
      } catch (e) {
        this.privacy = true;
      }
    },

    _detectChromePrivacy: function () {
      try {
        if (window['webkitRequestFileSystem']) {
          window['webkitRequestFileSystem'](
            window['TEMPORARY'],
            1,
            function () {
              this.privacy = false;
            }.bind(this),
            function () {
              this.privacy = true;
            }.bind(this),
          );
        } else {
          this.privacy = false;
        }
      } catch (e) {
        this.privacy = false;
      }
    },

    _detectFFPrivacy: function () {
      let DBConnection;
      try {
        DBConnection = window['indexedDB'].open('test');
        DBConnection['onerror'] = function () {
          this.privacy = true;
        }.bind(this);
        DBConnection['onsuccess'] = function () {
          this.privacy = false;
        }.bind(this);
      } catch (e) {
        this.privacy = true;
      }
    },

    _detectPrivacy: function () {
      if (this.browser.isIE) return this._detectIEPrivacy();
      if (this.browser.isSafari) return this._detectSafariPrivacy();
      if (this.browser.isChrome) return this._detectChromePrivacy();
      if (this.browser.isFF) return this._detectFFPrivacy();
    },

    report: function (callback) {
      if (this.privacy === null) {
        window.setTimeout(this['report'].bind(this, callback), 50);
      } else {
        detectPrivacyMode = this.privacy;
      }
    },
  };

  new PrivacyModeDetector();

  /**
   * PopUnder
   */
  function PopUnder() {
    this.init();
  }

  PopUnder.prototype = {
    cookieExpires: 6,
    filterParams: ['param1', 'param2', 'param3'],
    setting: {
      'cookie-name': 'popunder_event',
      params: ['domain=' + location.host || '', 'rnd=' + Math.random()],
    },
    mainWindow:
      top != self && typeof top.document.location.toString() == 'string'
        ? top
        : self,
    width: 1024,
    height: 768,
    top: 0,
    left: 0,
    init: function () {
      const currentScript = document.currentScript;
      const banner = dataPopUnder || currentScript;

      if (banner) {
        if (!dataPopUnder) {
          this.setBannerSettings(banner);
        } else {
          this.copySetting();
        }
        this.formatSetBannerSettings();
        this.addEvent('click', document, this.showPopUnder.bind(this));
      }
    },
    showPopUnder: function (event) {
      this.clickEvent = event || window.event;
      const element = this.clickEvent.target || this.clickEvent.srcElement;
      const href =
        element.href && this.getStringFormat(element.href.split('/'));

      if (this.doNotShow(element) || this.popUnderRunning) {
        return;
      }

      this.setUrl(href);

      this.openTab();
    },

    /**
     * Methods: Open Tab
     */
    openTab: function () {
      const event = this.clickEvent;
      const COUNT_PARENT = 4;
      let depth = 0;
      let target = event.target;

      event.preventDefault();

      if (target.nodeName.toLowerCase() !== 'a') {
        while (
          target.parentNode &&
          depth++ <= COUNT_PARENT &&
          target.nodeName.toLowerCase() !== 'html'
        ) {
          target = target.parentNode;
          if (target.nodeName.toLowerCase() === 'a' && target.href !== '') {
            break;
          }
        }
      }

      if (this.userAgent.winphone) {
        this.mobileTab(target);
      } else {
        this.desktopTab(target);
      }

      this.mainWindow.location = this.url;
    },
    mobileTab: function (target) {
      const hyperlink = document.createElement('a');
      let event;

      hyperlink.href = target.href || this.mainWindow.location;

      hyperlink.setAttribute('target', '_blank');

      try {
        event = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
        });
      } catch (e) {
        event = document.createEvent('MouseEvents');
        event.initMouseEvent(
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
    desktopTab: function (target) {
      const newTab = window.open(
        target.href || this.mainWindow.location,
        '_blank',
      );
      const cookieName = this.setting['cookie-name'];

      if (newTab) {
        newTab.focus();
        this.setCookie(cookieName, 1, this.cookieExpires);
      } else {
        this.url = target.href || this.mainWindow.location;
      }
    },
    // End Open Tab

    /**
     * Methods: Helper Methods
     */
    copySetting: function () {
      let value;

      for (const prop in dataPopUnder) {
        value = dataPopUnder[prop];
        if (this.filterParams.indexOf(prop) !== -1) {
          this.setting.params.push(prop + '=' + value);
          continue;
        }
        this.setting[prop] = value;
      }
    },
    doNotShow: function (element) {
      const ID_FIRST_MOUSE_BUTTON = 1;
      const which = this.clickEvent && this.clickEvent.which;
      const isATag = this.isSelectiveTarget(element);
      const userAgentVersion = parseInt(this.userAgent.version, 10);
      const cookieName = this.setting['cookie-name'];
      const showPopUnder =
        this.getCookie(cookieName) !== null ||
        this.checkIgnoreFilter(element) ||
        ('selective' === this.setting.mode && !isATag) ||
        (detectAdBlock && !isATag) ||
        !!element.getAttribute('target') ||
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
    checkIgnoreFilter: function (element) {
      const includeFilter = this.setting['include-filter'];

      if (includeFilter) {
        return !this.ignoreFilter(element);
      } else {
        return this.ignoreFilter(element);
      }
    },
    setBannerSettings: function (elm) {
      const attributes = elm.attributes;
      let settingsName, value;

      for (const key in attributes) {
        settingsName =
          typeof attributes[key] === 'object' && attributes[key].name;

        if (
          settingsName &&
          (settingsName.indexOf('data-ts') !== -1 ||
            settingsName.indexOf('data-id') !== -1)
        ) {
          settingsName = settingsName.replace('data-ts-', '');

          if (settingsName === 'data-id') {
            settingsName = 'spot';
          }

          value = attributes[key].value;

          if (this.filterParams.indexOf(settingsName) !== -1) {
            this.setting.params.push(settingsName + '=' + value);
            continue;
          }
          this.setting[settingsName] = value;
        }
      }
    },
    formatSetBannerSettings: function () {
      this.setting['categories'] = [
        this.setting['categories'],
        this.getMetaWords(),
      ].join(',');

      if (this.setting['ignore-filter']) {
        this.setting['ignore-filter'] = this.setting['ignore-filter']
          .replace(/\s+/g, '')
          .split(',');
      }
      if (this.setting['include-filter']) {
        this.setting['ignore-filter'] = this.setting['include-filter']
          .replace(/\s+/g, '')
          .split(',');
      }
      if (this.setting['redirect']) {
        this.setting['redirect'] = this.formatRedirectURL(
          this.setting['redirect'],
        );
      }
      if (this.setting['cookie-expires']) {
        this.cookieExpires = parseInt(this.setting['cookie-expires'], 10);
      }
    },
    formatRedirectURL: function (redirectUrl) {
      if (!/^(f|ht)tps?:\/\//i.test(redirectUrl)) {
        redirectUrl = 'http://' + redirectUrl;
      } else if (redirectUrl.slice(-1) !== '/') {
        redirectUrl += '/';
      }

      return redirectUrl;
    },
    setUrl: function (href) {
      const url =
        this.getRedirectUrl() +
        '?' +
        this.setting.params.join('&') +
        this.getPositionCursor() +
        this.getScreenSize() +
        this.timeZone() +
        '&adb=' +
        +detectAdBlock +
        '&priv=' +
        +detectPrivacyMode +
        '&categories=' +
        this.getCategories(href);

      this.url = url;
    },
    getScreenSize: function () {
      let screenSize = '';
      const devicePixelRatio = window['devicePixelRatio'] || 1;
      const screen = window['screen'] || {};
      const width = screen['width'];
      const height = screen['height'];

      if (width && height) {
        screenSize =
          '&w=' +
          parseInt(width * devicePixelRatio, 10) +
          '&h=' +
          parseInt(height * devicePixelRatio, 10);
      }

      return screenSize;
    },
    timeZone: function () {
      const tz = new Date().getTimezoneOffset();
      const param = '&tz=' + tz;
      return param.replace('-', '%2D');
    },
    getCategories: function (href) {
      let categories = this.setting.categories;

      if (!categories && href) {
        categories = href;
      } else if (!categories) {
        categories = this.getLocalStorage('ts_categories');
      }

      if (categories) {
        this.setLocalStorage('ts_categories', categories);
        this.setting.categories = categories;

        return categories;
      }

      return '';
    },
    getRedirectUrl: function () {
      const redirectUrlHasSpot =
        this.setting.redirect && this.setting.redirect.indexOf('{spot}') >= 0;
      const redirectReplaceUrl =
        redirectUrlHasSpot &&
        this.setting.redirect.replace('{spot}', this.setting.spot);

      if (redirectReplaceUrl) {
        return redirectReplaceUrl;
      }

      return (this.setting.redirect || this.getDomain()) + this.setting.spot;
    },
    isSelectiveTarget: function (elm) {
      let tag = elm.tagName.toLowerCase();

      while (tag && 'body' !== tag) {
        if ('a' === tag) return true;

        elm = elm.parentNode;
        tag = elm && elm.tagName && elm.tagName.toLowerCase();
      }

      return false;
    },
    getMetaWords: function () {
      const meta = document.getElementsByTagName('meta');
      const metaCount = meta.length;
      let getWords = '';
      let i = 0;

      while (i < metaCount) {
        if (
          meta[i].getAttribute('name') === 'description' ||
          meta[i].getAttribute('name') === 'keywords'
        ) {
          getWords += ' ' + meta[i].getAttribute('content');
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
    getStringFormat: function (arr) {
      const lastItem = arr && arr[arr.length - 1].split(/[?#]/)[0];

      let formatText =
        !!lastItem &&
        lastItem.replace(/(x?html?)$/gi, '').match(/([a-zA-Z]+)/g);

      formatText =
        formatText &&
        formatText.join(' ').replace(/(\b(\w{1,2})\b(\s|$))/g, '');

      return formatText || '';
    },
    addEvent: function (event, elem, func) {
      if (elem.addEventListener) {
        elem.addEventListener(event, func, false);
      } else if (elem.attachEvent) {
        const r = elem.attachEvent('on' + event, func);
        return r;
      }
    },
    getDomain: function () {
      const domain = '//tsyndicate.com';
      const pathname = '/api/v1/direct/';

      return domain + pathname;
    },
    getPositionCursor: function () {
      const documentElement = document.documentElement;
      const event = this.clickEvent;
      const x =
        event.pageX ||
        event.clientX +
          (documentElement.scrollLeft
            ? documentElement.scrollLeft
            : document.body.scrollLeft);
      const y =
        event.pageY ||
        event.clientY +
          (documentElement.scrollTop
            ? documentElement.scrollTop
            : document.body.scrollTop);

      return '&x=' + x + '&y=' + y;
    },
    // End Helper Methods

    /**
     * Methods: Ignore Filter
     */
    parentFilter: function (e) {
      const parentElm = e.parentNode;
      const isHtml =
        e.nodeName === 'HTML' || (parentElm && parentElm.nodeName === 'HTML');

      if (parentElm && !isHtml) {
        if (this.ignoreFilter(parentElm, true)) {
          return true;
        }
        return this.parentFilter(parentElm);
      }
    },
    ignoreFilter: function (elm, parentFilter) {
      const selectorsList = elm.className.split(' ');
      let i = 0;
      let count;

      elm.id && selectorsList.push(elm.id);

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
    },
    checkIgnore: function (elClass) {
      const ignoreList = this.setting['ignore-filter'];
      const count = ignoreList.length;
      let i = 0;

      for (; i < count; i++) {
        if (ignoreList[i] === elClass) {
          return true;
        }
      }
      return false;
    },
    // End Methods: Ignore Filter

    /**
     * Methods: LocalStorage
     */
    setLocalStorage: function (name, value) {
      try {
        if (window['localStorage']) {
          window['localStorage'].setItem(name, value);
        }
      } catch (e) {}
    },

    getLocalStorage: function (name) {
      try {
        if (window['localStorage']) {
          return window['localStorage'].getItem(name);
        }
      } catch (e) {}
    },

    /**
     * Methods: Cookie
     */
    setCookie: function (cookieName, cookieState, cookieLifetime) {
      const expires = new Date(
        new Date().getTime() + cookieLifetime * 3600000,
      ).toGMTString();
      const domain = this.setting['cookie-domain']
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
    getCookie: function (cookieName) {
      const resultCookie = document.cookie.match(
        '(^|;) ?' + cookieName + '=([^;]*)(;|$)',
      );

      if (resultCookie) return decodeURIComponent(resultCookie[2]);

      return null;
    },
    // End Methods Cookie

    /**
     * Methods: User Agent
     */
    userAgent: (function () {
      const n = navigator.userAgent.toLowerCase(),
        b = {
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
        };
      b.version = b.safari
        ? (n.match(/.+?(?:on|ri)[\/: ]([\d.]+)/) || [])[1]
        : (n.match(/.+(?:ox|me|ra|ie|opr)[\/: ]([\d.]+)/) || [])[1];
      return b;
    })(),
  };

  new PopUnder();
})(window);
