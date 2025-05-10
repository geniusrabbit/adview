type Asset = {
    name?: string;
    [key: string]: any;
}

function getAssertByName(name: string, assets?: Asset[]): Asset | null {
    if (!assets) {
        return null;
    }
    for (const asset of assets) {
        if (asset?.name === name) {
            return asset;
        }
    }
    return null;
}

export default getAssertByName;
