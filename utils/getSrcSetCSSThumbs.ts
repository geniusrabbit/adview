type Thumb = {
    width: number;
    path: string;
}

function srcSetCSSThumbs(thumbs?: Thumb[]): string {
    if (!thumbs || thumbs.length === 0) {
        return "";
    }
    const sset: string[] = [];
    for (const thumb of thumbs) {
        if (thumb.width > 0) {
            sset.push(`url('${thumb.path}') ${thumb.width}w`);
        }
    }
    return sset.join(",");
}

export default srcSetCSSThumbs;
