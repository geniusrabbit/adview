/**
 * Thumbnail object with width and path information
 */
type Thumb = {
    width: number;
    path: string;
}

/**
 * Generates CSS-style srcset string for responsive images.
 * Creates a comma-separated list of image sources with width descriptors.
 * 
 * @param thumbs - Array of thumbnail objects with width and path
 * @returns CSS srcset string or empty string if no valid thumbs
 */
function srcSetCSSThumbs(thumbs?: Thumb[]): string {
    // Return empty string if no thumbs provided
    if (!thumbs || thumbs.length === 0) {
        return "";
    }
    
    const sset: string[] = [];
    
    // Build srcset entries for each valid thumbnail
    for (const thumb of thumbs) {
        if (thumb.width > 0) {
            sset.push(`url('${thumb.path}') ${thumb.width}w`);
        }
    }
    
    // Join all entries with commas
    return sset.join(",");
}

export default srcSetCSSThumbs;
