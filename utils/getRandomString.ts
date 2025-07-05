/**
 * Generates a random alphanumeric string for cache-busting and unique identifiers.
 * Uses a combination of uppercase, lowercase letters, numbers, and underscore.
 * 
 * @param num - Length of the random string to generate (defaults to 5)
 * @returns Random string of specified length
 */
function getRandomString(num: number): string {
    // Character set for random string generation
    const abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';
    const length = num || 5; // Default length is 5 if not specified
    let text = '';

    // Generate a random character from the abc string for each position
    for (let i = 0; i < length; i++) {
        text += abc.charAt(Math.floor(Math.random() * abc.length));
    }

    return text;
}

export default getRandomString;
