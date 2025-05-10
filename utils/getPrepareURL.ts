function prepareURL(url: string): string;
function prepareURL(url?: string): string | undefined;
function prepareURL(url?: string): string | undefined {
    const isServer = typeof window === 'undefined';

    if (url?.startsWith("//") && !isServer) {
        if (window.location.protocol !== "http:" && window.location.protocol !== "https:") {
            return "https:" + url;
        }
        return window.location.protocol + url;
    }

    return url;
}

export default prepareURL;
