/**
 * Prepares URLs by adding proper protocol for protocol-relative URLs.
 * Handles cases where URLs start with "//" by adding the current page's protocol.
 * 
 * @param url - The URL to prepare (can be undefined)
 * @returns The prepared URL with proper protocol, or undefined if input was undefined
 */
function prepareURL(url: string): string;
function prepareURL(url?: string): string | undefined;
function prepareURL(url?: string): string | undefined {
    const isServer = typeof window === 'undefined';

    // Handle protocol-relative URLs (starting with "//")
    if (url?.startsWith("//") && !isServer) {
        // Use https as fallback for non-standard protocols
        if (window.location.protocol !== "http:" && window.location.protocol !== "https:") {
            return "https:" + url;
        }
        // Use current page's protocol
        return window.location.protocol + url;
    }

    return url;
}

export default prepareURL;
