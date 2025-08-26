import PopUnder from './popunder';
import { CheckAdBlockOptions, CheckAdBlockVar, PopUnderData } from './types';

(function (window: Window): void {
  'use strict';

  // @ts-ignore
  let detectAdBlock: boolean = false;
  // @ts-ignore
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
  new (PopUnder as any)();
})(window);
