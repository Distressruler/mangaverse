export function titleCase(input: string): string {
    // Split the input string into an array of words
    const words = input.split(' ');

    // Capitalize the first letter of each word
    const titleCasedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));

    // Join the title-cased words back into a string
    const titleCasedString = titleCasedWords.join(' ');

    return titleCasedString;
}