import type { AdAsset } from '../types';

/**
 * Retrieves an asset by its name from the provided assets array.
 * @param name - The name of the asset to retrieve.
 * @param assets - Array of asset objects.
 * @returns The asset object if found; otherwise, null.
 */
export function assertByName(name: string, assets: AdAsset[]): AdAsset | null {
  if (!assets) {
    return null;
  }
  for (const i in assets) {
    const assert = assets[i];
    if (assert.name == name) {
      return assert;
    }
  }
  return null;
}

export default assertByName;
