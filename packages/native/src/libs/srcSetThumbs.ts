import { AdThumbnail } from '../types';

/**
 * Generates a srcset string for <img> tags based on the provided thumbnails.
 * @param thumbs - Array of thumbnail objects containing 'path' and 'width'.
 * @returns A comma-separated srcset string.
 */
function srcSetThumbs(thumbs: AdThumbnail[]): string {
  if (!thumbs || thumbs.length <= 0) {
    return '';
  }
  const sset: string[] = [];
  for (const i in thumbs) {
    const thumb = thumbs[i];
    if (thumb.width > 0) {
      sset.push(thumb.path + ' ' + thumb.width + 'w');
    }
  }
  return sset.join(',');
}

export default srcSetThumbs;
