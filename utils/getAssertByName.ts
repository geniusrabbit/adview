/**
 * Asset type definition for ad assets (images, videos, etc.)
 */
type Asset = {
    name?: string;
    [key: string]: any;
}

/**
 * Finds an asset by its name from an array of assets.
 * Commonly used to retrieve specific assets like 'main', 'thumbnail', etc.
 * 
 * @param name - The name of the asset to find
 * @param assets - Array of asset objects to search through
 * @returns The matching asset object or null if not found
 */
function getAssetByName(name: string, assets?: Asset[]): Asset | null {
    // Return null if assets array is not provided
    if (!assets) {
        return null;
    }
    
    // Search through assets for matching name
    for (const asset of assets) {
        if (asset?.name === name) {
            return asset;
        }
    }
    
    // Return null if no matching asset found
    return null;
}

export default getAssetByName;
