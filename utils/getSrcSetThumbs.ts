/**
 * Thumbnail object with width and path information
 */
type Thumb = {
    width: number;
    path: string;
}

/**
 * Generates HTML srcset string for responsive images.
 * Creates a comma-separated list of image sources with width descriptors
 * following the HTML img srcset attribute format.
 * 
 * @param thumbs - Array of thumbnail objects with width and path
 * @returns HTML srcset string or empty string if no valid thumbs
 */
function getSrcSetThumbs(thumbs?: Thumb[]): string {
    // Return empty string if no thumbs provided
    if (!thumbs || thumbs.length <= 0) {
        return "";
    }
    
    const sset: string[] = [];
    
    // Build srcset entries for each valid thumbnail
    for (const thumb of thumbs) {
        if (thumb.width > 0) {
            sset.push(`${thumb.path} ${thumb.width}w`);
        }
    }
    
    // Join all entries with commas (HTML srcset format)
    return sset.join(",");
}

export default getSrcSetThumbs;
