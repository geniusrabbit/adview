import prepareURL from "./getPrepareURL";

function executeTracking(trackers?: string[]): HTMLImageElement[] | null {
    if (trackers?.length != null) {
      return trackers.map(tracker => {
          const imageSrc = prepareURL(tracker);
          const img = new Image();

          img.src = imageSrc;

          return img;
      });
  }


  return  null
}

export default executeTracking;
