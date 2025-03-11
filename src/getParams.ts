// @ts-nocheck
export function getParams(url = location.href): Record<string, string> {
  const search = new URL(url).search;
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    result[decodeURIComponent(key)] = decodeURIComponent(value);
  }
  return result;
}
