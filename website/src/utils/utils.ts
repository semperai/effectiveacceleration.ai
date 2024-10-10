export function shortenText({text, maxLength} : {text: string | `0x${string}` | undefined, maxLength: number}) {
    if (!text) return console.log("No text provided");
    if (text.length <= maxLength) {
      return text;
    }
  
    const partLength = Math.floor((maxLength - 3) / 2); // Subtract 3 for the ellipsis
    const start = text.slice(0, partLength + 1);
    const end = text.slice(-partLength + 1);
  
    return `${start}...${end}`;
  }