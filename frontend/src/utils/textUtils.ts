export function elliptText(str: string, start = 6, end = start) {
  if (str && str.length > start + end + 1) {
    return `${str.slice(0, start)}…${str.slice(str.length - end, str.length)}`;
  }
  return str ?? '';
}

export function elliptAddress(address: string, size = 4) {
  return elliptText(address, 2 + size, size);
}
