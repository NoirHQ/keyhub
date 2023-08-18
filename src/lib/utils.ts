export function timestamp(date: string | number | Date) {
  return Math.floor(new Date(date).getTime() / 1000);
}

export function camelToKebab(s: string) {
  return s.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}
