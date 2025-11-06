import { getPrepareURL } from '@adview/core/utils';
import type { AdItem } from '../types';
import assertByName from '../libs/assertByName';
import srcSetThumbs from '../libs/srcSetThumbs';

/**
 * Render class handles the rendering of different types of advertisements
 * (proxy, native, banner) into specified target elements.
 */
export class Render {
  /**
   * Renders a preloader for an ad slot.
   * @param target - The DOM element where the preloader will be rendered.
   */
  preload(target: HTMLElement | null): void {
    if (target) {
      target.innerHTML = '';
    }
  }

  /**
   * Renders a proxy advertisement.
   * @param data - The ad data containing content or URLs.
   * @param target - The DOM element where the ad will be rendered.
   */
  proxy(data: AdItem, target: HTMLElement | null): void {
    if (!target) return;

    if (data.content) {
      // If ad content is a string, render it as HTML
      this.renderHTML(data.content, target);
    } else if (data.fields && (data.fields.url || data.content_url)) {
      // If ad data contains a URL, render it within an iframe
      this.renderHTML(
        '<iframe width="' +
          (data.format?.w || '100%') +
          '"' +
          ' height="' +
          (data.format?.h || '100%') +
          '"' +
          ' style="border:0;margin:0;padding:0;width:' +
          (data.format?.w || '100%') +
          ';height:' +
          (data.format?.h || '100%') +
          ';" src="' +
          (data.fields.url || data.content_url) +
          '" allowfullscreen></iframe>',
        target,
      );
    } else {
      // Throw an error if the ad format is invalid
      throw new Error('invalid format response type: proxy');
    }
  }

  /**
   * Renders a native advertisement.
   * @param data - The ad data containing fields and assets.
   * @param target - The DOM element where the ad will be rendered.
   */
  native(data: AdItem, target: HTMLElement | null): void {
    if (!target) return;

    const fields = data.fields;
    const asset = assertByName('main', data.assets || []);

    if (!asset) {
      throw new Error('Main asset not found for native ad');
    }

    // Construct the native ad HTML template with dynamic data
    target.innerHTML =
      '<div class="banner native">' +
      '  <a target="_blank" href="' +
      getPrepareURL(data.url || '') +
      '" class="image">' +
      '    <img alt="main" style="object-fit:cover;width:100%;height:100%;" src="' +
      asset.path +
      '" srcset="' +
      srcSetThumbs(asset.thumbs || []) +
      '" />' +
      '  </a>' +
      '  <div class="label">' +
      (fields?.title
        ? '<a target="_blank" href="' +
          getPrepareURL(data.url || '') +
          '" class="title">' +
          fields.title +
          '</a>'
        : '') +
      (fields?.description
        ? '<a target="_blank" href="' +
          getPrepareURL(data.url || '') +
          '" class="description">' +
          fields.description +
          '</a>'
        : '') +
      (fields?.brandname
        ? '<a target="_blank" href="' +
          getPrepareURL(data.url || '') +
          '" class="brand">' +
          fields.brandname +
          '</a>'
        : '') +
      (fields?.phone
        ? '<a target="_blank" href="' +
          getPrepareURL(data.url || '') +
          '" class="phone">' +
          fields.phone +
          '</a>'
        : '') +
      (fields?.url
        ? '<a target="_blank" href="' +
          getPrepareURL(data.url || '') +
          '" class="url">' +
          fields.url +
          '</a>'
        : '') +
      '  </div>' +
      '</div>';
  }

  /**
   * Renders a banner advertisement.
   * @param data - The ad data containing assets.
   * @param target - The DOM element where the ad will be rendered.
   */
  banner(data: AdItem, target: HTMLElement | null): void {
    if (!target) return;

    const asset = assertByName('main', data.assets || []);
    if (!asset) {
      throw new Error('Main asset not found for banner ad');
    }

    target.innerHTML =
      '<div style="text-align: center;">' +
      '<a target="_blank" href="' +
      getPrepareURL(data.url || '') +
      '" class="banner" style="font-size:0">' +
      '<img alt="main" src="' +
      asset.path +
      '" srcset="' +
      srcSetThumbs(asset.thumbs || []) +
      '" />' +
      '</a>' +
      '</div>';
  }

  /**
   * Renders a custom default template
   * @param target - The DOM element where the ad will be rendered.
   */
  default(target: HTMLElement | null): void {
    if (!target) return;

    const custom = target.querySelector(
      'script[type="html/template"][data-type=default]',
    ) as HTMLScriptElement | null;
    target.innerHTML = custom ? custom.innerHTML : '';
  }

  /**
   * Injects raw HTML into the target element. If the HTML contains <script> tags,
   * it safely injects the content within an iframe to prevent script execution in the main DOM.
   * @param html - The HTML string to render.
   * @param target - The DOM element where the HTML will be injected.
   */
  html(html: string, target: HTMLElement | null): void {
    if (!target) return;

    const elm = target;

    if (/<script[^>]*>/gi.test(html)) {
      // If HTML contains <script> tags, inject it into an iframe
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.setAttribute('width', '100%');
      iframe.setAttribute('height', '100%');
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('marginwidth', '0');
      iframe.setAttribute('marginheight', '0');
      iframe.setAttribute('vspace', '0');
      iframe.setAttribute('hspace', '0');
      iframe.setAttribute('allowtransparency', 'true');
      iframe.setAttribute('scrolling', 'no');
      iframe.setAttribute('allowfullscreen', 'true');

      // Construct the complete HTML document for the iframe
      html =
        '<!DOCTYPE html><html><head>' +
        '<meta name="viewport" content="width=device-width, initial-scale=1">' +
        '<meta charset="utf-8" />' +
        '<style>*,body,html{margin:0;padding:0;border:none;}' +
        'body,html{width:100%;height:100%;}</style>' +
        '</head><body><center>' +
        html +
        '</center></body></html>';

      // Append the iframe to the target element
      elm.appendChild(iframe);

      // Write the HTML content into the iframe's document
      if (iframe.contentWindow) {
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(html);
        iframe.contentWindow.document.close();
      }
    } else {
      // If no <script> tags, inject the HTML directly
      elm.innerHTML = html;

      // Re-execute any inline <script> tags by replacing them with new script elements
      Array.from(elm.querySelectorAll('script')).forEach(function (
        el: HTMLScriptElement,
      ) {
        const newEl = document.createElement('script');
        Array.from(el.attributes).forEach(function (attr: Attr) {
          newEl.setAttribute(attr.name, attr.value);
        });
        if (el.innerHTML) {
          newEl.appendChild(document.createTextNode(el.innerHTML));
        }
        if (el.parentNode) {
          el.parentNode.replaceChild(newEl, el);
        }
      });
    }
  }

  /**
   * Helper method to render HTML content into the target element.
   * @param htmlContent - The HTML content to render.
   * @param targetElement - The DOM element where the HTML will be injected.
   */
  renderHTML(htmlContent: string, targetElement: HTMLElement): void {
    targetElement.innerHTML = htmlContent;
  }
}
