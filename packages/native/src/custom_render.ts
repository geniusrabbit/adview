// Usage Example:

/*
import { EmbeddedAd } from './path-to-embedded-ad';
import { CustomRender } from './path-to-custom-render';

// Initialize CustomRender and add templates
const customRender = new CustomRender();

// Adding a proxy ad template
customRender.addTemplate('proxy', `
  <div class="ad-proxy">
    <a href="{{url}}" target="_blank">
      <img src="{{mainAsset.url}}" alt="{{mainAsset.alt}}" />
    </a>
    <p>{{fields.description}}</p>
  </div>
`);

// Adding a native ad template
customRender.addTemplate('native', `
  <div class="ad-native">
    <a href="{{url}}" target="_blank">
      <img src="{{mainAsset.url}}" alt="{{mainAsset.alt}}" />
    </a>
    <h3>{{fields.title}}</h3>
    <p>{{fields.content}}</p>
  </div>
`);

// Adding a banner ad template
customRender.addTemplate('banner', `
  <div class="ad-banner">
    <a href="{{url}}" target="_blank">
      <img src="{{mainAsset.url}}" alt="{{mainAsset.alt}}" />
    </a>
  </div>
`);

// Create a new EmbeddedAd instance with custom settings and CustomRender
const ad = new EmbeddedAd({
  element: 'ad-container', // ID of the DOM element where the ad will be rendered
  zone_id: '12345',         // Your ad zone ID
  JSONPLink: 'https://ads.example.com/getAd', // Your JSONP endpoint
  render: customRender,     // Use the CustomRender instance
});

// Register event callbacks
ad.on('loading', (data) => {
  console.log('Ad is loading:', data);
}).on('render', (success) => {
  if (success) {
    console.log('Ad rendered successfully.');
  } else {
    console.log('Ad rendering failed.');
  }
}).on('error', (error) => {
  console.error('An error occurred while rendering the ad:', error);
});

// Initiate the ad rendering process
ad.render();
*/

import { renderTemplate as rt } from './libs/template';
import { Render } from './renders/render';
import { getPrepareURL } from '@adview/core/utils';
import type { Template, AdItem } from './types';
import assertByName from './libs/assertByName';

/**
 * CustomRender class extends the rendering capabilities by allowing
 * custom templates for different ad types (proxy, native, banner).
 */
export class CustomRender {
  private _templates: Template[];
  private _r: Render;

  /**
   * Constructor initializes the templates array and an instance of the Render class.
   */
  constructor(render?: Render) {
    // Array to store templates with their corresponding names
    this._templates = [];

    // Instance of the Render class to handle default rendering
    this._r = render ?? new Render();
  }

  /**
   * Adds a new template to the CustomRender instance.
   * @param name - The name of the template (e.g., 'proxy', 'native', 'banner').
   * @param template - The HTML template string with placeholders.
   */
  addTemplate(name: string, template: string): void {
    this._templates.push({
      name,
      template,
    });
  }

  /**
   * Retrieves a template by its name.
   * @param name - The name of the template to retrieve.
   * @returns The template string if found, otherwise null.
   */
  getTemplateByName(name: string): string | null {
    for (const it of this._templates) {
      if (it.name === name) {
        return it.template;
      }
    }
    return null;
  }

  /**
   * Renders a template with the provided data.
   * @param name - The name of the template to render.
   * @param data - The data object to populate the template placeholders.
   * @returns The rendered HTML string or an empty string if the template is not found.
   */
  renderTemplate(name: string, data: AdItem | Record<string, any>): string {
    // Retrieve the template by name
    const tmpl = this.getTemplateByName(name);
    if (!tmpl) {
      // Return an empty string if the template does not exist
      return '';
    }

    // Prepare the data by merging with additional processed fields
    const newData: any = {
      ...data,
      ...{
        // Prepare and sanitize URLs if they exist
        url: (data as AdItem).url
          ? getPrepareURL((data as AdItem).url)
          : undefined,
        content_url: (data as AdItem).content_url
          ? getPrepareURL((data as AdItem).content_url)
          : undefined,

        // Retrieve the main asset using the assertByName utility
        mainAsset: assertByName('main', (data as AdItem).assets || []),
      },
    };

    // If there are fields with a URL, prepare the URL
    if (newData.fields && newData.fields.url) {
      newData.fields.url = getPrepareURL(newData.fields.url);
    }

    // Render the template with the prepared data
    return rt(tmpl, newData);
  }

  /**
   * Renders a preloader for an ad slot. Falls back to default rendering if no template is found.
   * @param target - The DOM element where the preloader will be rendered.
   */
  preload(target: HTMLElement | null): void {
    // Attempt to render using the 'preload' template
    const tmpl = this.renderTemplate('preload', {});
    if (!tmpl) {
      // If template is not found, use the default Render class method
      this._r.preload(target);
    } else {
      // Otherwise, render the HTML using the custom template
      this._r.html(tmpl, target);
    }
  }

  /**
   * Renders a proxy ad. Falls back to default rendering if no template is found.
   * @param data - The ad data.
   * @param target - The DOM element where the ad will be rendered.
   */
  proxy(data: AdItem, target: HTMLElement | null): void {
    // Attempt to render using the 'proxy' template
    const tmpl = this.renderTemplate('proxy', data);
    if (!tmpl) {
      // If template is not found, use the default Render class method
      this._r.proxy(data, target);
    } else {
      // Otherwise, render the HTML using the custom template
      this._r.html(tmpl, target);
    }
  }

  /**
   * Renders a native ad. Falls back to default rendering if no template is found.
   * @param data - The ad data.
   * @param target - The DOM element where the ad will be rendered.
   */
  native(data: AdItem, target: HTMLElement | null): void {
    // Attempt to render using the 'native' template
    const tmpl = this.renderTemplate('native', data);
    if (!tmpl) {
      // If template is not found, use the default Render class method
      this._r.native(data, target);
    } else {
      // Otherwise, render the HTML using the custom template
      this._r.html(tmpl, target);
    }
  }

  /**
   * Renders a banner ad. Falls back to default rendering if no template is found.
   * @param data - The ad data.
   * @param target - The DOM element where the ad will be rendered.
   */
  banner(data: AdItem, target: HTMLElement | null): void {
    // Attempt to render using the 'banner' template
    const tmpl = this.renderTemplate('banner', data);
    if (!tmpl) {
      // If template is not found, use the default Render class method
      this._r.banner(data, target);
    } else {
      // Otherwise, render the HTML using the custom template
      this._r.html(tmpl, target);
    }
  }

  /**
   * Renders a default ad. Falls back to default rendering if no template is found.
   * @param target - The DOM element where the ad will be rendered.
   */
  default(target: HTMLElement | null): void {
    // Attempt to render using the 'default' template
    const tmpl = this.renderTemplate('default', {});
    if (!tmpl) {
      // If template is not found, use the default Render class method
      this._r.default(target);
    } else {
      // Otherwise, render the HTML using the custom template
      this._r.html(tmpl, target);
    }
  }

  /**
   * Renders raw HTML into the target element.
   * @param html - The HTML string to render.
   * @param target - The DOM element where the HTML will be injected.
   */
  html(html: string, target: HTMLElement | null): void {
    this._r.html(html, target);
  }

  /**
   * Clones the CustomRender instance.
   * @returns A new CustomRender instance with the same templates.
   */
  clone(): CustomRender {
    const cr = new CustomRender();
    cr._templates = [...this._templates];
    return cr;
  }
}
