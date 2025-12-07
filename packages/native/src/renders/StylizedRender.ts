import { getPrepareURL } from '@adview/core';
import assertByName from '../libs/assertByName';
import srcSetThumbs from '../libs/srcSetThumbs';
import type { AdItem } from '../types';
import { Render } from './render';
import styles from './StylizedRender.module.css';

class StylizedRender extends Render {
  constructor() {
    super();

    if (typeof document !== 'undefined') {
      const styleId = 'adview-stylized-render-styles';
      if (!document.getElementById(styleId)) {
        const link = document.createElement('link');
        link.id = styleId;
        link.rel = 'stylesheet';
        link.href = `${process.env.ADVIEW_STYLES_PATH}/stylesStylizedRender.css`;
        document.head.appendChild(link);
      }
    }
  }
  native(data: AdItem, target: HTMLElement | null): void {
    if (!target) return;

    const fields = data.fields;
    const asset = assertByName('main', data.assets || []);

    if (!asset) {
      throw new Error('Main asset not found for native ad');
    }

    // Create main container
    const mainDiv = document.createElement('div');
    mainDiv.className = styles['adview-stylized-render-main'];

    // Create link container
    const linkContainer = document.createElement('a');
    linkContainer.className = styles['adview-stylized-render-container'];
    linkContainer.href = getPrepareURL(data.url || '');
    linkContainer.target = '_blank';
    linkContainer.rel = 'noopener noreferrer';

    // Create image span
    const imgSpan = document.createElement('span');
    imgSpan.className = styles['adview-stylized-render-img-wrapper'];
    const img = document.createElement('img');
    img.className = styles['adview-stylized-render-img'];
    img.src = asset.path;
    img.alt = fields?.title || 'Advertisement';
    if (asset.thumbs && asset.thumbs.length > 0) {
      img.srcset = srcSetThumbs(asset.thumbs);
    }
    imgSpan.appendChild(img);

    // Create content span
    const contentSpan = document.createElement('span');
    contentSpan.className = styles['adview-stylized-render-content'];

    if (fields?.title) {
      const titleSpan = document.createElement('span');
      titleSpan.className = styles['adview-stylized-render-title'];
      titleSpan.textContent = fields.title;
      contentSpan.appendChild(titleSpan);
    }

    if (fields?.description) {
      const descSpan = document.createElement('span');
      descSpan.className = styles['adview-stylized-render-description'];
      descSpan.textContent = fields.description;
      contentSpan.appendChild(descSpan);
    }

    const ctaSpan = document.createElement('span');
    ctaSpan.className = styles['adview-stylized-render-link-call-to-action'];
    ctaSpan.textContent = 'Learn More';
    contentSpan.appendChild(ctaSpan);

    // Append to link container
    linkContainer.appendChild(imgSpan);
    linkContainer.appendChild(contentSpan);

    // Create menu wrapper only if meta data exists
    if (data.meta && data.meta.items && data.meta.items.length > 0) {
      const menuWrapper = document.createElement('div');
      menuWrapper.className = styles['adview-stylized-render-menu-wrapper'];

      const menuBtn = document.createElement('button');
      menuBtn.className = styles['adview-stylized-render-menu-btn'];
      menuBtn.setAttribute('aria-label', 'Ad context menu');
      menuBtn.type = 'button';

      const menuIcon = document.createElement('span');
      menuIcon.className = styles['adview-stylized-render-menu-icon'];
      menuIcon.textContent = '⋮';
      menuBtn.appendChild(menuIcon);

      // Dropdown menu
      const menuDropdown = document.createElement('div');
      menuDropdown.className = styles['adview-stylized-render-menu-dropdown'];

      // Create menu items from meta data
      data.meta.items.forEach(item => {
        if (item.title && item.value) {
          const menuLink = document.createElement('a');
          menuLink.href = item.value;
          menuLink.className = styles['adview-stylized-render-menu-item'];
          menuLink.textContent = item.title;
          menuLink.target = '_blank';
          menuLink.rel = 'noopener noreferrer nofollow';
          menuDropdown.appendChild(menuLink);
        }
      });

      menuWrapper.appendChild(menuBtn);
      menuWrapper.appendChild(menuDropdown);

      // Toggle menu on button click
      menuBtn.addEventListener('click', e => {
        e.stopPropagation();
        menuWrapper.classList.toggle(styles['active']);
      });

      // Close menu when clicking outside
      document.addEventListener('click', () => {
        menuWrapper.classList.remove(styles['active']);
      });

      // Append menu to main div
      mainDiv.appendChild(menuWrapper);
    }

    // Assemble the ad
    mainDiv.appendChild(linkContainer);

    // Clear target and append
    target.innerHTML = '';
    target.appendChild(mainDiv);
  }
}

export default StylizedRender;
