export function capitalizeEachWord(text: string): string {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
}
  