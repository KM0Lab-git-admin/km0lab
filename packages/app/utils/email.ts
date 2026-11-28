/** Shape check only; whether the address exists is decided by the server. */
export const isEmailFormat = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
