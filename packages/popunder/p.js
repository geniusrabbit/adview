(function (window) {
  'use strict';

  var version = '0.1.9',
    build_version = '201',
    detectAdBlock = false,
    detectPrivacyMode = false;
  var dataPopUnder = window.dataPopUnder;

  /**
   * Polyfill: indexOf
   */
  if (typeof Array.prototype.indexOf == 'undefined') {
    Array.prototype.indexOf = function (obj, start) {
      for (var i = start || 0, j = this.length; i < j; i++) {
        if (this[i] === obj) {
          return i;
        }
      }
      return -1;
    };
  }

  /**
   * Polyfill: bind
   */
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
      if (typeof this !== 'function') {
        throw new TypeError(
          'Function.prototype.bind - what is trying to be bound is not callable',
        );
      }
      var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        Fnop = function () {},
        fBound = function () {
          return fToBind.apply(
            this instanceof Fnop && oThis ? this : oThis,
            aArgs.concat(Array.prototype.slice.call(arguments)),
          );
        };
      Fnop.prototype = this.prototype;
      fBound.prototype = new Fnop();
      return fBound;
    };
  }

  /**
   * Check AdBlock
   */
  var CheckAdBlock = function () {
    var userAgent = window.navigator.userAgent;

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

    var self = this;
    var eventCallback = function () {
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
      var bait = document.createElement('div');
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

      var self = this;
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
      var detected = false;

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
        var baitTemp = window.getComputedStyle(this._var.bait, null);
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
      var msie = this.ua.indexOf('msie ');
      if (msie > 0) {
        return parseInt(
          this.ua.substring(msie + 5, this.ua.indexOf('.', msie)),
          10,
        );
      }

      var trident = this.ua.indexOf('trident/');
      if (trident > 0) {
        var rv = this.ua.indexOf('rv:');
        return parseInt(
          this.ua.substring(rv + 3, this.ua.indexOf('.', rv)),
          10,
        );
      }

      var edge = this.ua.indexOf('edge/');
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
      var browsers = {
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
      var DBConnection;
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
    filterParams: [
      'param1',
      'param2',
      'param3',
      'subid',
      'subid_1',
      'subid_2',
      'subid_3',
      'subid_4',
      'subid_5',
      'xhid',
    ],
    setting: {
      'cookie-name': 'ts_popunder',
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

    /**
     * Methods: Window setting
     */
    screenX: function () {
      return this.getWindowLeft() + this.getWindowWidth() / 2 - this.width / 2;
    },
    screenY: function () {
      return this.getWindowTop() + this.getWindowHeight() / 2 - this.height / 2;
    },
    widthWindow: function () {
      return this.width - this.magicNumbers().x;
    },
    heightWindow: function () {
      return this.height - this.magicNumbers().y;
    },
    windowSetting: function () {
      var setting =
        'toolbar=no,scrollbars=yes,location=yes,statusbar=yes,menubar=no,resizable=1' +
        ',width=' +
        this.widthWindow() +
        ',height=' +
        this.heightWindow() +
        ',screenX=' +
        this.screenX() +
        ',screenY=' +
        this.screenY();

      return setting;
    },
    // End Window setting

    init: function () {
      var banner = dataPopUnder || this.eachScript();
      var mouseEvent = this.checkWinChrome60() ? 'mousedown' : 'click';

      if (banner) {
        if (!dataPopUnder) {
          this.setBannerSettings(banner);
        } else {
          this.copySetting();
        }
        this.formatSetBannerSettings();
        this.addEvent(mouseEvent, document, this.showPopUnder.bind(this));
      }
    },
    showPopUnder: function (event) {
      this.clickEvent = event || window.event;
      var element = this.clickEvent.target || this.clickEvent.srcElement;
      var href = element.href && this.getStringFormat(element.href.split('/'));
      var versionBrowser = parseInt(this.userAgent.version, 10);

      if (this.doNotShow(element) || this.popUnderRunning) {
        return;
      }

      this.setUrl(href);

      if (
        // For Opera
        this.userAgent.ios &&
        this.userAgent.safari &&
        this.userAgent.mobile &&
        versionBrowser > 1000
      ) {
        this.openWindow(event);
        this.mainWindow.location = element.getAttribute('href');
      } else if (
        !detectAdBlock &&
        !this.userAgent.mobile &&
        !this.userAgent.android &&
        !this.userAgent.ios
      ) {
        if (
          (!this.userAgent.edge &&
            this.userAgent.macosx &&
            ((this.userAgent.chrome && versionBrowser >= 61) ||
              (this.userAgent.safari && versionBrowser >= 11))) ||
          (!this.userAgent.edge &&
            this.userAgent.windows &&
            versionBrowser >= 62)
        ) {
          this.openTab();
        } else if (
          !this.userAgent.opera &&
          !this.userAgent.edge &&
          this.userAgent.chrome &&
          versionBrowser > 41
        ) {
          this.popUnderPDFInit(event, element);
        } else if (
          this.userAgent.edge ||
          (this.userAgent.windows && this.userAgent.opera) ||
          this.userAgent.yaBrowser
        ) {
          this.openTab();
        } else {
          this.openWindow(event);
        }
      } else {
        this.openTab();
      }
    },

    /**
     * Methods: Open Tab
     */
    openTab: function () {
      var event = this.clickEvent;
      var target = event.target || event.srcElement;
      var COUNT_PARENT = 4;
      var depth = 0;

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
      var hyperlink = document.createElement('a');
      var event;

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
      var newTab = window.open(
        target.href || this.mainWindow.location,
        '_blank',
      );
      var cookieName = this.setting['cookie-name'];

      if (newTab) {
        newTab.focus();
        this.setCookie(cookieName, 1, this.cookieExpires);
      } else {
        this.url = target.href || this.mainWindow.location;
      }
    },
    // End Open Tab

    /**
     * Methods: Open Window
     */
    openWindow: function (event) {
      var cookieName = this.setting['cookie-name'];
      this.popUp = window.open(this.url, '_blank', this.windowSetting());

      if (this.popUp) {
        this.setCookie(cookieName, 1, this.cookieExpires);

        if (
          this.userAgent.ios &&
          event.target.tagName.toLowerCase() === 'img'
        ) {
          event.preventDefault();
        }
        if (this.userAgent.msie) {
          document.onclick = null;
          this.popUp.blur();
          window.focus();
        } else {
          this.catchEvent();
        }
      }
    },
    catchEvent: function () {
      try {
        this.popUp.blur();
        this.popUp.opener.window.focus();
        window.self.window.blur();
        window.self.window.focus();
        window.focus();

        if (
          this.userAgent.safari &&
          parseInt(this.userAgent.version, 10) >= 9
        ) {
          this.fakeTab();
          return;
        }

        this.userAgent.firefox && this.fakeTab();
        this.userAgent.webkit && this.webkitEvent();
      } catch (e) {}
    },
    fakeTab: function () {
      var blank = window.open('about:blank');
      blank.focus();
      blank.close();
    },
    webkitEvent: function () {
      var a = document.createElement('a'),
        e = document.createEvent('MouseEvents');
      a.href =
        'data:text/html;charset=utf-8,%3Cscript%3Ewindow.close()%3C/script%3E';
      document.getElementsByTagName('body')[0].appendChild(a);
      e.initMouseEvent(
        'click',
        !1,
        !0,
        window,
        0,
        0,
        0,
        0,
        0,
        !0,
        !1,
        !1,
        !0,
        0,
        null,
      );
      a.dispatchEvent(e);
      a.parentNode.removeChild(a);
    },
    // End Open Window

    /**
     * Methods: Catch popunder
     */
    replacementCampaign: function (params) {
      if ('campaignid' in params) {
        this.setting['redirect'] = this.getDomain() + 'campaign/{spot}';
        this.setting['spot'] = params['campaignid'];

        if ('bannerid' in params) {
          this.setting['redirect'] += '/' + params['bannerid'];
        }

        this.setting['redirect'] += '/test';
      }
    },
    // End catch popunder

    /**
     * Methods: Helper Methods
     */
    copySetting: function () {
      var value;

      for (var prop in dataPopUnder) {
        value = dataPopUnder[prop];
        if (this.filterParams.indexOf(prop) != -1) {
          this.setting.params.push(prop + '=' + value);
          continue;
        }
        this.setting[prop] = value;
      }
    },
    doNotShow: function (element) {
      var ID_FIRST_MOUSE_BUTTON = 1;
      var which = this.clickEvent && this.clickEvent.which;
      var isATag = this.isSelectiveTarget(element);
      var userAgentVersion = parseInt(this.userAgent.version, 10);
      var cookieName = this.setting['cookie-name'];
      var showPopUnder =
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

      if (which && which != ID_FIRST_MOUSE_BUTTON) {
        return true;
      }

      return showPopUnder;
    },
    checkIgnoreFilter: function (element) {
      var includeFilter = this.setting['include-filter'];

      if (includeFilter) {
        return !this.ignoreFilter(element);
      } else {
        return this.ignoreFilter(element);
      }
    },
    eachScript: function () {
      var currentScript = document.currentScript;
      var banner, spot, width, height, redirect;

      if (currentScript) {
        spot =
          this.getAttr(arr[i], 'data-ts-spot') ||
          this.getAttr(arr[i], 'data-id');
        width = this.getAttr(arr[i], 'data-ts-width');
        height = this.getAttr(arr[i], 'data-ts-height');
        redirect = this.getAttr(arr[i], 'data-ts-redirect');

        if ((!!spot || !!redirect) && !width && !height) {
          banner = arr[i];
        }
      }

      return banner;
    },
    setBannerSettings: function (elm) {
      var attributes = elm.attributes;
      var settingsName, value;

      for (var key in attributes) {
        settingsName =
          typeof attributes[key] === 'object' && attributes[key].name;

        if (
          settingsName &&
          (settingsName.indexOf('data-ts') != -1 ||
            settingsName.indexOf('data-id') != -1)
        ) {
          settingsName = settingsName.replace('data-ts-', '');

          if (settingsName === 'data-id') {
            settingsName = 'spot';
          }

          value = attributes[key].value;

          if (this.filterParams.indexOf(settingsName) != -1) {
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

      this.replacementCampaign(this.setting);
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
      var url =
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
      var screenSize = '';
      var devicePixelRatio = window['devicePixelRatio'] || 1;
      var screen = window['screen'] || {};
      var width = screen['width'];
      var height = screen['height'];

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
      var tz = new Date().getTimezoneOffset();
      var param = '&tz=' + tz;
      return param.replace('-', '%2D');
    },
    getCategories: function (href) {
      var categories = this.setting.categories;

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
      var redirectUrlHasSpot =
        this.setting.redirect && this.setting.redirect.indexOf('{spot}') >= 0;
      var redirectReplaceUrl =
        redirectUrlHasSpot &&
        this.setting.redirect.replace('{spot}', this.setting.spot);

      if (redirectReplaceUrl) {
        return redirectReplaceUrl;
      }

      return (this.setting.redirect || this.getDomain()) + this.setting.spot;
    },
    isSelectiveTarget: function (elm) {
      var tag = elm.tagName.toLowerCase();

      while (tag && 'body' !== tag) {
        if ('a' === tag) return true;

        elm = elm.parentNode;
        tag = elm && elm.tagName && elm.tagName.toLowerCase();
      }

      return false;
    },
    getAttr: function (ele, attr) {
      var result = (ele.getAttribute && ele.getAttribute(attr)) || null;

      if (!result && typeof ele !== 'function') {
        var attrs = ele.attributes;
        var length = attrs.length;
        for (var i = 0; i < length; i++) {
          if (attrs[i].nodeName === attr) {
            result = attrs[i].nodeValue;
          }
        }
      }
      return result;
    },
    getMetaWords: function () {
      var meta = document.getElementsByTagName('meta');
      var metaCount = meta.length;
      var i = 0;
      var getWords = '';

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
      var lastItem = arr && arr[arr.length - 1].split(/[?#]/)[0];

      var formatText =
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
        var r = elem.attachEvent('on' + event, func);
        return r;
      }
    },
    getDomain: function () {
      var domain = '//tsyndicate.com';
      var pathname = '/api/v1/direct/';

      return domain + pathname;
    },
    getPositionCursor: function () {
      var documentElement = document.documentElement;
      var event = this.clickEvent;
      var x =
        event.pageX ||
        event.clientX +
          (documentElement.scrollLeft
            ? documentElement.scrollLeft
            : document.body.scrollLeft);
      var y =
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
      var parentElm = e.parentNode;
      var isHtml =
        e.nodeName === 'HTML' || (parentElm && parentElm.nodeName === 'HTML');

      if (parentElm && !isHtml) {
        if (this.ignoreFilter(parentElm, true)) {
          return true;
        }
        return this.parentFilter(parentElm);
      }
    },
    ignoreFilter: function (elm, parentFilter) {
      var i = 0,
        selectorsList = elm.className.split(' '),
        elementTag = elm.tagName.toLowerCase(),
        count;

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
      var i = 0;
      var ignoreList = this.setting['ignore-filter'];
      var count = ignoreList.length;

      for (; i < count; i++) {
        if (ignoreList[i] === elClass) {
          return true;
        }
      }
      return false;
    },
    // End Methods: Ignore Filter

    /**
     * Methods: PDF Show
     */
    checkWinChrome60: function () {
      return (
        !this.userAgent.edge &&
        this.userAgent.windows &&
        !this.userAgent.windowsXP &&
        this.userAgent.chrome &&
        parseInt(this.userAgent.version, 10) >= 59
      );
    },
    PDFFile: '//cdn.tsyndicate.com/sdk/v1/p_pdf.pdf',
    popUnderPDF: null,
    popUnderRunning: false,
    popUnderPostCalled: false,
    randomString: Math.floor(Math.random() * 1000 + 1).toString(),
    // blankPdf: 'data:application/pdf;base64, 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',
    hiddenWindowSetting:
      'directories=0,toolbar=0,scrollbars=1,location=0,statusbar=0,menubar=0,resizable=1,width=1,height=1,screenX=19999,screenY=19999',
    popUnderPDFInit: function (event, element) {
      if (this.popUnderRunning) return false;

      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();

      this.popUnderRunning = true;

      if (this.checkWinChrome60()) {
        this.popUnderWindowsPDF(element);
        return false;
      }

      this.catchFocusIFrame();

      this.createPDFObjectHandle = this.createPDFObject();
      // addNotification  (Chrome > 57)
      if (parseInt(this.userAgent.version, 10) > 57) {
        this.addNotification();
      }

      this.catchFocusEvent(event);
    },
    catchFocusIFrame: function () {
      try {
        var popFrame = window.document.createElement('iframe');
        var windowBody =
          '<html><head><script>window.a={};window.a.b=function(){window.resizeTo(1,0);window.moveTo(19999,19999);};window.a.b();window.open("", "_self");</script></head><body></body></html>';

        popFrame.setAttribute('style', 'display:none');

        window.document.body.appendChild(popFrame);

        var popFrameScript =
          popFrame.contentWindow.document.createElement('script');

        popFrameScript.innerHTML =
          '(' +
          function () {
            var frameWindow = eval('window');
            frameWindow.init = function (rnd, options) {
              return frameWindow.open('about:blank', rnd, options);
            };
          }.toString() +
          ')();';

        popFrame.contentWindow.document.body.appendChild(popFrameScript);

        this.popUnderPDF = popFrame.contentWindow.init(
          this.randomString,
          this.hiddenWindowSetting,
        );

        window.document.body.removeChild(popFrame);

        this.popUnderPDF.document.write(windowBody);
      } catch (c) {}
    },
    catchFocusEvent: function (event) {
      var element = event.target || event.srcElement;
      var self = this;
      var checkTimer = null;

      if (!this.userAgent.macosx) {
        checkTimer = setInterval(function () {
          if (document.hasFocus()) {
            catchFocus();
            return false;
          }
        }, 20);
      }

      this.addEvent('focus', window, catchFocus);
      setTimeout(catchFocus, 3000);

      function catchFocus() {
        if (!self.userAgent.macosx) {
          clearInterval(checkTimer);
        }
        self.focusAchieved(element);
      }
    },
    focusAchieved: function (element) {
      if (!this.popUnderPostCalled) {
        this.popUnderPostCalled = true;
        this.postWindowPop(element);
      }
    },
    postWindowPop: function (element) {
      var self = this;
      var cookieName = this.setting['cookie-name'];

      if (parseInt(this.userAgent.version, 10) > 57) {
        // removeNotification (Chrome > 57)
        this.removeNotification();
        // addNotification (Chrome > 57)
        this.addNotification();
      }

      setTimeout(function () {
        self.createPDFObjectHandle.parentNode.parentNode.removeChild(
          self.createPDFObjectHandle.parentNode,
        );
      }, 20);

      try {
        this.popUnderPDF.moveTo(this.screenX(), this.screenY());
        this.popUnderPDF.resizeBy(this.widthWindow(), this.heightWindow());
        setTimeout(function () {
          // removeNotification (Chrome > 57)
          if (parseInt(self.userAgent.version, 10) > 57)
            self.removeNotification();
        }, 200);
        self.popUnderPDF.location = self.url;
      } catch (e) {}

      this.triggerClick(element);

      this.popUnderRunning = false;

      this.setCookie(cookieName, 1, this.cookieExpires);
    },
    createPDFObject: function () {
      var wrapper = document.createElement('div');
      var wrapperStyle =
        'visibility:hidden;width:0px;height:0px;opacity:0;position:absolute;top:100%;left:0;pointer-events:none;overflow:hidden;';
      var object = document.createElement('object');

      wrapper.setAttribute('style', wrapperStyle);
      wrapper.setAttribute('inf', 'inf');

      object.setAttribute('data', this.PDFFile);

      wrapper.appendChild(object);

      document.body.appendChild(wrapper);

      return object;
    },
    triggerClick: function (element) {
      try {
        var mouseEvent = document.createEvent('MouseEvents');

        mouseEvent.initMouseEvent(
          'click',
          true,
          true,
          window,
          1,
          0,
          0,
          0,
          0,
          false,
          false,
          false,
          false,
          0,
          null,
        );
        element.dispatchEvent(mouseEvent);

        this.popUnderRunning = false;
      } catch (e) {}
    },
    addNotification: function () {
      var iframeNotification = (this.iframeNotification =
        document.createElement('iframe'));

      iframeNotification.width = 0;
      iframeNotification.height = 0;
      iframeNotification.style.width = '0';
      iframeNotification.style.height = '0';
      iframeNotification.srcdoc =
        '<script>try {Notification.requestPermission(function () {});navigator.requestMIDIAccess({ sysex: true });} catch (e) {}</script>';

      document.body.appendChild(iframeNotification);
    },
    removeNotification: function () {
      if (this.iframeNotification) {
        this.iframeNotification.parentNode.removeChild(this.iframeNotification);
      }
    },
    popUnderWindowsPDF: function (element) {
      var newTab = window.open('about:blank', '_blank');
      var clickEvent = this.clickEvent;
      var mouseEvent = newTab.document.createEvent('MouseEvents');
      var self = this;
      var windowBody =
        '<html><head><title></title>' +
        '<meta name="Referrer" content="unsafe-url"><script>' +
        '(function() {' +
        'var winName = "TrafficStars";' +
        'var winParams =' +
        this.hiddenWindowSetting +
        ';' + //''"status=1,menubar=0,toolbar=0,height=0,width=0,top=0,location=0,scrollbars=1,resizable=1,left=0";' +
        'window.addEventListener("mouseup", function() {' +
        'if (window.w) return;' +
        'window.w = window.open("about:blank", winName, winParams);' +
        'w.resizeTo(1, 0);' +
        'w.moveTo(9e5, 9e5);' +
        '});' +
        '})();' +
        '</script></head><body></body></html>';

      newTab.document.write(windowBody);
      mouseEvent.initMouseEvent(
        'click',
        true,
        true,
        newTab,
        1,
        clickEvent.screenX,
        clickEvent.screenY,
        clickEvent.clientX,
        clickEvent.clientY,
        false,
        false,
        false,
        false,
        0,
        null,
      );
      newTab.dispatchEvent(mouseEvent);

      var checkTimer = setInterval(function () {
        if (newTab.w) {
          clearInterval(checkTimer);
          self.createPDFObjectHandle = self.createPDFObject();
          self.addEvent('focus', window, catchPDFFocus);
          newTab.close();
        }
      }, 20);

      function catchPDFFocus() {
        var cookieName = self.setting['cookie-name'];
        self.createPDFObjectHandle.parentNode.parentNode &&
          self.createPDFObjectHandle.parentNode.parentNode.removeChild(
            self.createPDFObjectHandle.parentNode,
          );

        if (newTab.w) {
          newTab.w.resizeTo(self.heightWindow(), self.heightWindow());
          newTab.w.moveTo(self.screenX(), self.screenY());
          newTab.w.location.replace('http://' + self.url);

          window.removeEventListener('focus', catchPDFFocus, false);
          self.setCookie(cookieName, 1, self.cookieExpires);
          self.triggerClick(element);
        }
      }

      this.popUnderRunning = false;
    },
    // End Methods: PDF Show

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
      var expires = new Date(
        new Date().getTime() + cookieLifetime * 3600000,
      ).toGMTString();
      var domain = this.setting['cookie-domain']
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
      var resultCookie = document.cookie.match(
        '(^|;) ?' + cookieName + '=([^;]*)(;|$)',
      );

      if (resultCookie) return decodeURIComponent(resultCookie[2]);

      return null;
    },
    // End Methods Cookie

    /**
     * Methods: window settings
     */
    getWindowWidth: function () {
      var width = 0;
      if (typeof window.innerWidth == 'number') {
        width = window.innerWidth;
      } else {
        if (document.documentElement && document.documentElement.clientWidth) {
          width = document.documentElement.clientWidth;
        } else {
          if (document.body && document.body.clientWidth) {
            width = document.body.clientWidth;
          }
        }
      }
      return width;
    },
    getWindowHeight: function () {
      var height = 0;
      if (typeof window.innerHeight == 'number') {
        height = window.innerHeight;
      } else {
        if (document.documentElement && document.documentElement.clientHeight) {
          height = document.documentElement.clientHeight;
        } else {
          if (document.body && document.body.clientHeight) {
            height = document.body.clientHeight;
          }
        }
      }
      return height;
    },
    getWindowLeft: function () {
      return window.screenLeft !== undefined
        ? window.screenLeft
        : window.screenX;
    },
    getWindowTop: function () {
      return window.screenTop !== undefined ? window.screenTop : window.screenY;
    },
    magicNumbers: function () {
      if (this.userAgent.macosx) {
        if (this.userAgent.chrome) return { x: 100, y: 71 };
        if (this.userAgent.opera) return { x: 100, y: 86 };
      }

      if (this.userAgent.windows) {
        if (this.userAgent.chrome) return { x: 122, y: 34 };
        if (this.userAgent.opera) return { x: 270, y: 129 };
      }

      return { x: 0, y: 0 };
    },
    // End Methods: window settings

    /**
     * Methods: User Agent
     */
    userAgent: (function () {
      var n = navigator.userAgent.toLowerCase(),
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
