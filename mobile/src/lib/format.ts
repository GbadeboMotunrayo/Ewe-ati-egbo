/** Pence → "£12.99". All money in the app is stored in integer pence. */
export function gbp(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

export function eta(minDays: number, maxDays: number): string {
  return `${minDays}–${maxDays} days`;
}
