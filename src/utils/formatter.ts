export function shortenAddress(address: string, len: number = 3): string {
  const startChars = address.substring(0, len);
  const endChars = address.substring(address.length - len);
  const shortenedAddress = `${startChars}...${endChars}`;
  return shortenedAddress;
}
