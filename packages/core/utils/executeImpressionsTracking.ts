import prepareURL from "./getPrepareURL";

/**
 * Executes tracking pixels by creating Image elements and loading tracking URLs.
 * This is commonly used for impression tracking, click tracking, and analytics.
 * 
 * @param trackers - Array of tracking pixel URLs to fire
 * @returns Array of Image elements created for tracking, or null if no trackers provided
 */
function executeTracking(trackers?: string[]): HTMLImageElement[] | null {
    // Check if trackers array exists and has content
    if (trackers?.length != null) {
      return trackers.map(tracker => {
          // Prepare URL to handle protocol-relative URLs
          const imageSrc = prepareURL(tracker);
          
          // Create a new Image element for pixel tracking
          const img = new Image();
          
          // Setting src automatically fires the HTTP request
          img.src = imageSrc;

          return img;
      });
  }

  // Return null if no trackers to execute
  return null;
}

export default executeTracking;
