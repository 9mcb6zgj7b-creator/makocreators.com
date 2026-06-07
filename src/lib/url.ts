export function splitUrls(input: string | undefined) {
  if (!input) return [];
  return input
    .split(/[\n,，\s]+/)
    .map(item => item.trim())
    .filter(Boolean);
}
