function getRandomString(num: number): string {
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
